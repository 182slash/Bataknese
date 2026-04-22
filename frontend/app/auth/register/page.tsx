'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Mail, Lock, User, Calendar, Phone, MapPin, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { MargaReference } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

const iconStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.30)', width: 16, height: 16 };

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
        colorScheme: 'dark',
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

function GlassSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
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
        colorScheme: 'dark',
        appearance: 'none',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'rgba(139,0,0,0.55)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,0,0,0.15), inset 0 2px 6px rgba(0,0,0,0.40)';
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
        e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.50)';
      }}
    >
      {children}
    </select>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.50)' }}>
      {children}
    </label>
  );
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
      {children}
    </span>
  );
}

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
    if (isAuthenticated) router.push('/dashboard');
    const fetchMargaList = async () => {
      try {
        const response = await apiClient.get('/auth/marga-list');
        if (response.data.success) setMargaList(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil daftar marga:', error);
      }
    };
    fetchMargaList();
  }, [isAuthenticated, router]);

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Mohon isi semua kolom yang wajib diisi'); return false;
    }
    if (formData.password.length < 6) {
      toast.error('Kata sandi minimal harus 6 karakter'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Kata sandi tidak cocok'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.marga || !formData.date_of_birth) {
      toast.error('Mohon isi semua kolom yang wajib diisi'); return false;
    }
    return true;
  };

  const handleNextStep = () => { if (step === 1 && validateStep1()) setStep(2); };
  const handlePrevStep = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const success = await register({
      full_name: formData.full_name, marga: formData.marga, email: formData.email,
      password: formData.password, gender: formData.gender, date_of_birth: formData.date_of_birth,
      phone: formData.phone, address: formData.address, city: formData.city, province: formData.province,
    });
    if (success) router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left — Branding ──────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d0000 0%, #2a0000 35%, #6b0000 70%, #4a2800 100%)' }}
      >
        {/* Ulos weave */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            repeating-linear-gradient(45deg,  rgba(139,0,0,1)    0px, rgba(139,0,0,1)    1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(212,175,55,1)  0px, rgba(212,175,55,1)  1px, transparent 1px, transparent 20px)
          `,
          opacity: 0.06,
        }} />

        {/* Ambient blobs */}
        <div className="absolute pointer-events-none" style={{
          top: '-60px', right: '-60px', width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 68%)', filter: 'blur(70px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: '-80px', left: '-80px', width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,0,0,0.45) 0%, transparent 68%)', filter: 'blur(90px)',
        }} />

        {/* Frosted sheen */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        }} />

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-28 h-28 rounded-xl rotate-12 pointer-events-none"
          style={{ border: '2px solid rgba(255,255,255,0.10)' }} />
        <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full pointer-events-none"
          style={{ border: '2px solid rgba(212,175,55,0.22)' }} />
        <div className="absolute bottom-20 left-10 w-14 h-14 rounded-lg -rotate-6 pointer-events-none"
          style={{ border: '2px solid rgba(139,0,0,0.35)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-14 text-white w-full">
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
            <Crown style={{ color: '#D4AF37', width: 52, height: 52 }} />
          </div>

          <h1 className="font-cinzel text-5xl font-bold mb-3 text-white tracking-wide">Gabung Bataknese</h1>
          <p className="font-cinzel text-xl mb-10" style={{ color: '#E5C453' }}>Langkah {step} dari 2</p>

          <p className="text-lg leading-relaxed max-w-sm mb-10" style={{ color: 'rgba(255,255,255,0.68)' }}>
            {step === 1
              ? 'Buat akun Anda dan dapatkan Kartu Identitas Batak eksklusif Anda'
              : 'Beri tahu kami lebih banyak tentang warisan Batak dan detail pribadi Anda'}
          </p>

          {/* Step indicator */}
          <div
            className="flex items-center gap-4 px-8 py-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            {[1, 2].map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold font-cinzel transition-all duration-300"
                  style={step >= s ? {
                    background: 'rgba(255,255,255,0.95)',
                    color: '#8B0000',
                    border: '2px solid #fff',
                    boxShadow: '0 0 16px rgba(255,255,255,0.30)',
                  } : {
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.45)',
                    border: '2px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {s}
                </div>
                {i === 0 && (
                  <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: step >= 2 ? '100%' : '0%', background: 'rgba(255,255,255,0.80)' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Form ─────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto relative"
        style={{ background: '#000000' }}
      >
        {/* Ambient glow */}
        <div className="absolute pointer-events-none" style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '640px', height: '640px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,0,0,0.14) 0%, transparent 68%)', filter: 'blur(60px)',
        }} />
        <div className="absolute pointer-events-none" style={{
          top: '-40px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', filter: 'blur(50px)',
        }} />

        <div className="w-full max-w-md relative z-10 py-8">

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
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>Langkah {step} dari 2</p>
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
            {/* Header stripe */}
            <div
              className="px-8 py-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(139,0,0,0.09)' }}
            >
              <h2 className="font-cinzel text-2xl font-bold text-white mb-0.5">
                {step === 1 ? 'Buat Akun' : 'Detail Pribadi'}
              </h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {step === 1 ? 'Atur kredensial Anda' : 'Lengkapi profil Anda'}
              </p>
            </div>

            <div className="px-8 py-6">
              <form
                onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}
                className="space-y-4"
              >
                {step === 1 ? (
                  <>
                    <div>
                      <FieldLabel>Nama Lengkap *</FieldLabel>
                      <div className="relative">
                        <IconWrap><User style={iconStyle} /></IconWrap>
                        <GlassInput type="text" value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Contoh: John Siregar" required style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Alamat Email *</FieldLabel>
                      <div className="relative">
                        <IconWrap><Mail style={iconStyle} /></IconWrap>
                        <GlassInput type="email" value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email.anda@contoh.com" required style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Kata Sandi *</FieldLabel>
                      <div className="relative">
                        <IconWrap><Lock style={iconStyle} /></IconWrap>
                        <GlassInput type="password" value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Minimal 6 karakter" required style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Konfirmasi Kata Sandi *</FieldLabel>
                      <div className="relative">
                        <IconWrap><Lock style={iconStyle} /></IconWrap>
                        <GlassInput type="password" value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Ulangi kata sandi Anda" required style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <GlassPrimaryBtn type="submit" className="w-full mt-2">
                      Lanjut ke Detail Pribadi
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </GlassPrimaryBtn>
                  </>
                ) : (
                  <>
                    <div>
                      <FieldLabel>Marga *</FieldLabel>
                      <GlassSelect value={formData.marga}
                        onChange={(e) => setFormData({ ...formData, marga: e.target.value })} required>
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
                      </GlassSelect>
                    </div>

                    <div>
                      <FieldLabel>Jenis Kelamin *</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Male', 'Female', 'Other'] as const).map((gender) => (
                          <button key={gender} type="button"
                            onClick={() => setFormData({ ...formData, gender })}
                            className="py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                            style={formData.gender === gender ? {
                              background: 'linear-gradient(135deg, rgba(139,0,0,0.55), rgba(92,0,0,0.45))',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              border: '1px solid rgba(185,28,28,0.55)',
                              color: '#ffffff',
                              boxShadow: '0 0 14px rgba(139,0,0,0.32)',
                            } : {
                              background: 'rgba(255,255,255,0.05)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              color: 'rgba(255,255,255,0.45)',
                            }}
                          >
                            {gender === 'Male' ? 'Laki-laki' : gender === 'Female' ? 'Perempuan' : 'Lainnya'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Tanggal Lahir *</FieldLabel>
                      <div className="relative">
                        <IconWrap><Calendar style={iconStyle} /></IconWrap>
                        <GlassInput type="date" value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          required style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Nomor Telepon</FieldLabel>
                      <div className="relative">
                        <IconWrap><Phone style={iconStyle} /></IconWrap>
                        <GlassInput type="tel" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+62 812 3456 7890" style={{ paddingLeft: '2.5rem' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Kota</FieldLabel>
                        <div className="relative">
                          <IconWrap><MapPin style={iconStyle} /></IconWrap>
                          <GlassInput type="text" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Jakarta" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Provinsi</FieldLabel>
                        <GlassInput type="text" value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          placeholder="DKI Jakarta" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={handlePrevStep}
                        className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.10)',
                          color: 'rgba(255,255,255,0.75)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)';
                          (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Kembali
                      </button>
                      <GlassPrimaryBtn type="submit" disabled={isLoading} className="flex-1">
                        {isLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                          : 'Buat Akun'}
                      </GlassPrimaryBtn>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center mb-6">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Sudah punya akun?{' '}
              <Link href="/auth/login"
                className="font-semibold transition-colors duration-150"
                style={{ color: '#D4AF37' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E5C453')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D4AF37')}
              >
                Masuk
              </Link>
            </p>
          </div>

          <div className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>
            <p>© 2024 Bataknese. Hak cipta dilindungi undang-undang.</p>
            <p className="mt-1">Merayakan warisan dan persatuan Batak</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Primary glass button ───────────────────────────────────────── */
function GlassPrimaryBtn({
  children, className = '', disabled = false, type = 'button',
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(185,28,28,0.88) 0%, rgba(139,0,0,0.82) 55%, rgba(92,0,0,0.78) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(185,28,28,0.45)',
        boxShadow: '0 4px 24px rgba(139,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.16)',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(139,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.20)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(139,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.16)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
}