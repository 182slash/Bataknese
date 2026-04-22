'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, MessageCircle, MapPin, User as UserIcon } from 'lucide-react';
import { User, MargaReference, SearchFilters } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

/* ── shared inline style tokens ───────────────────────────────── */
const G = {
  sidebar: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(40px) saturate(170%)',
    WebkitBackdropFilter: 'blur(40px) saturate(170%)',
    borderRight: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '4px 0 32px rgba(0,0,0,0.50)',
  } as React.CSSProperties,

  card: {
    background: 'rgba(255,255,255,0.055)',
    backdropFilter: 'blur(24px) saturate(150%)',
    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
    borderRadius: '1rem',
  } as React.CSSProperties,

  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.28)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '0.625rem',
    padding: '0.625rem 0.875rem',
    color: '#ffffff',
    fontSize: '0.875rem',
    outline: 'none',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.50)',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
};

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [margaList, setMargaList] = useState<MargaReference>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    marga: '',
    gender: '',
    city: '',
    province: '',
    min_age: undefined,
    max_age: undefined,
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => { fetchMargaList(); }, []);
  useEffect(() => { fetchUsers(); }, [filters.page]);

  const fetchMargaList = async () => {
    try {
      const response = await apiClient.get('/auth/marga-list');
      if (response.data.success) setMargaList(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil daftar marga:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      const response = await apiClient.get(`/users/search?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Gagal mengambil data anggota:', error);
      toast.error('Gagal memuat anggota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchUsers();
  };

  const handleReset = () => {
    setFilters({
      name: '', marga: '', gender: '', city: '', province: '',
      min_age: undefined, max_age: undefined, page: 1, limit: 20,
    });
    setTimeout(fetchUsers, 100);
  };

  const createDMRoom = async (userId: string) => {
    try {
      const response = await apiClient.get(`/chat/dm/${userId}`);
      if (response.data.success) {
        window.location.href = `/chat?room=${response.data.data.room.id}`;
      }
    } catch {
      toast.error('Gagal membuat chat');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col w-80 overflow-y-auto flex-shrink-0`}
        style={G.sidebar}
      >
        {/* Sidebar header */}
        <div
          className="px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(139,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-cinzel text-xl font-bold text-white">Filter</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="md:hidden p-1.5 rounded-lg transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Cari dan filter anggota</p>
        </div>

        {/* Filter fields */}
        <div className="p-6 space-y-5 flex-1">
          <FilterField label="Nama">
            <GlassInput
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="Cari berdasarkan nama..."
            />
          </FilterField>

          <FilterField label="Marga">
            <GlassSelect
              value={filters.marga}
              onChange={(e) => setFilters({ ...filters, marga: e.target.value })}
            >
              <option value="">Semua Marga</option>
              {Object.entries(margaList).map(([subEthnic, margas]) => (
                <optgroup key={subEthnic} label={subEthnic}>
                  {margas.map((marga) => (
                    <option key={marga.id} value={marga.marga_name}>{marga.marga_name}</option>
                  ))}
                </optgroup>
              ))}
            </GlassSelect>
          </FilterField>

          <FilterField label="Jenis Kelamin">
            <GlassSelect
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            >
              <option value="">Semua Jenis Kelamin</option>
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
              <option value="Other">Lainnya</option>
            </GlassSelect>
          </FilterField>

          <FilterField label="Rentang Usia">
            <div className="grid grid-cols-2 gap-2">
              <GlassInput
                type="number"
                value={filters.min_age || ''}
                onChange={(e) => setFilters({ ...filters, min_age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Min"
              />
              <GlassInput
                type="number"
                value={filters.max_age || ''}
                onChange={(e) => setFilters({ ...filters, max_age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Maks"
              />
            </div>
          </FilterField>

          <FilterField label="Kota">
            <GlassInput
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Jakarta, Medan, dll."
            />
          </FilterField>

          <FilterField label="Provinsi">
            <GlassInput
              type="text"
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              placeholder="DKI Jakarta, dll."
            />
          </FilterField>

          <div className="space-y-2 pt-2">
            <GlassButton onClick={handleSearch} variant="primary" full>
              <Search className="w-4 h-4 mr-2" />
              Terapkan Filter
            </GlassButton>
            <GlassButton onClick={handleReset} variant="ghost" full>
              Atur Ulang Filter
            </GlassButton>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">

          {/* Header */}
          <div
            className="flex items-center justify-between mb-8 rounded-2xl px-7 py-5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(32px) saturate(160%)',
              WebkitBackdropFilter: 'blur(32px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div>
              <h1 className="font-cinzel text-4xl font-bold text-white mb-1">Direktori Anggota</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {pagination.total} anggota ditemukan
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse p-6" style={{ ...G.card }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-4 w-32 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={G.card}
            >
              <UserIcon className="w-20 h-20 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.18)' }} />
              <h3 className="font-cinzel text-2xl text-white mb-2">Anggota tidak ditemukan</h3>
              <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Coba sesuaikan filter Anda</p>
              <GlassButton onClick={handleReset} variant="primary">Atur Ulang Filter</GlassButton>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} onMessage={createDMRoom} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <GlassButton
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={pagination.page === 1}
                    variant="ghost"
                  >
                    Sebelumnya
                  </GlassButton>
                  <span
                    className="px-4 py-2 rounded-xl text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <GlassButton
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    variant="ghost"
                  >
                    Selanjutnya
                  </GlassButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── User Card ──────────────────────────────────────────────────── */
function UserCard({ user, onMessage }: { user: User; onMessage: (id: string) => void }) {
  return (
    <div
      className="flex flex-col items-center text-center p-6 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        borderRadius: '1rem',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.09)';
        el.style.borderColor = 'rgba(255,255,255,0.18)';
        el.style.boxShadow = '0 8px 48px rgba(0,0,0,0.65), 0 0 20px rgba(139,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)';
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.055)';
        el.style.borderColor = 'rgba(255,255,255,0.10)';
        el.style.boxShadow = '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* Avatar */}
      <div className="mb-4 relative">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.full_name}
            width={80}
            height={80}
            className="rounded-full object-cover w-20 h-20"
            style={{
              border: '2px solid rgba(139,0,0,0.50)',
              boxShadow: '0 0 20px rgba(139,0,0,0.30)',
            }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,0,0,0.80) 0%, rgba(212,175,55,0.60) 100%)',
              border: '2px solid rgba(139,0,0,0.45)',
              boxShadow: '0 0 20px rgba(139,0,0,0.30)',
            }}
          >
            <span className="text-white font-cinzel font-bold text-2xl">
              {user.full_name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg text-white mb-0.5">{user.full_name}</h3>
      <p className="font-cinzel text-sm mb-1" style={{ color: '#D4AF37' }}>{user.marga}</p>
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.batak_id_card}</p>

      {(user.city || user.province) && (
        <div
          className="flex items-center gap-1 text-xs mb-4 px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <MapPin className="w-3 h-3" />
          <span>{user.city}{user.city && user.province && ', '}{user.province}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 w-full mt-auto">
        <Link
          href={`/profile/${user.id}`}
          className="flex-1 py-2 rounded-xl text-sm font-medium text-center transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.80)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.11)';
            (e.currentTarget as HTMLElement).style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.80)';
          }}
        >
          Lihat Profil
        </Link>
        <button
          onClick={() => onMessage(user.id)}
          className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(185,28,28,0.75) 0%, rgba(139,0,0,0.70) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(185,28,28,0.38)',
            color: '#ffffff',
            boxShadow: '0 2px 14px rgba(139,0,0,0.28)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 22px rgba(139,0,0,0.50)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 14px rgba(139,0,0,0.28)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Pesan
        </button>
      </div>
    </div>
  );
}

/* ── Primitives ─────────────────────────────────────────────────── */
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function GlassInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={G.input}
      onFocus={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(139,0,0,0.55)';
        (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(139,0,0,0.15), inset 0 2px 6px rgba(0,0,0,0.40)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.09)';
        (e.currentTarget as HTMLInputElement).style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.50)';
      }}
    />
  );
}

function GlassSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...G.input, appearance: 'none' }}
      onFocus={(e) => {
        (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(139,0,0,0.55)';
        (e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(139,0,0,0.15), inset 0 2px 6px rgba(0,0,0,0.40)';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.09)';
        (e.currentTarget as HTMLSelectElement).style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.50)';
      }}
    >
      {children}
    </select>
  );
}

function GlassButton({
  children,
  onClick,
  variant = 'ghost',
  full = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  full?: boolean;
  disabled?: boolean;
}) {
  const base: React.CSSProperties = variant === 'primary'
    ? {
        background: 'linear-gradient(135deg, rgba(185,28,28,0.78) 0%, rgba(139,0,0,0.72) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(185,28,28,0.40)',
        color: '#ffffff',
        boxShadow: '0 2px 16px rgba(139,0,0,0.30)',
      }
    : {
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'rgba(255,255,255,0.75)',
      };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${full ? 'w-full' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
      style={base}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLButtonElement;
        if (variant === 'primary') el.style.boxShadow = '0 4px 22px rgba(139,0,0,0.50)';
        else { el.style.background = 'rgba(255,255,255,0.10)'; el.style.color = '#ffffff'; }
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLButtonElement;
        if (variant === 'primary') el.style.boxShadow = '0 2px 16px rgba(139,0,0,0.30)';
        else { el.style.background = 'rgba(255,255,255,0.06)'; el.style.color = 'rgba(255,255,255,0.75)'; }
        el.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
}