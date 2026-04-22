'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Building2, Users, Search, X, MapPin } from 'lucide-react';
import { Community } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    province: '',
  });

  useEffect(() => {
    fetchCommunities();
  }, [searchQuery]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const params = searchQuery ? `?search=${searchQuery}` : '';
      const response = await apiClient.get(`/communities${params}`);
      if (response.data.success) {
        setCommunities(response.data.data.communities);
      }
    } catch (error) {
      console.error('Gagal mengambil data komunitas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/communities', formData);
      if (response.data.success) {
        toast.success('Komunitas berhasil dibuat!');
        setShowCreateModal(false);
        fetchCommunities();
        setFormData({ name: '', description: '', category: '', city: '', province: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat komunitas');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/join`);
      toast.success('Berhasil bergabung dengan komunitas!');
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal bergabung dengan komunitas');
    }
  };

  return (
    <div className="min-h-screen p-8 relative">

      {/* Ambient background blobs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 15% 10%, rgba(139,0,0,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 85% 80%, rgba(92,0,0,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 30% 30% at 60% 40%, rgba(212,175,55,0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between mb-10 rounded-2xl px-8 py-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
      >
        <div>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-1 tracking-wide">
            Komunitas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>
            Temukan dan bergabung dengan komunitas Batak
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Komunitas
        </button>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="mb-8 max-w-md">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.30)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.50)',
          }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-11 pr-4 py-3 text-white outline-none placeholder:text-white/30 text-sm"
            placeholder="Cari komunitas..."
          />
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.60)',
                padding: '1.5rem',
              }}
            >
              <div className="h-32 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-4 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-4 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoinCommunity}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ───────────────────────────────────────── */}
      {showCreateModal && (
        <CreateCommunityModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCommunity}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMMUNITY CARD
══════════════════════════════════════════════════════════════ */
function CommunityCard({
  community,
  onJoin,
}: {
  community: Community;
  onJoin: (id: string) => void;
}) {
  return (
    <div
      className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.09)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.18)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 48px rgba(0,0,0,0.70), 0 0 20px rgba(139,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.12)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.055)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.10)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Banner */}
      <div className="relative w-full h-36 overflow-hidden">
        {community.avatar ? (
          <Image
            src={community.avatar}
            alt={community.name}
            width={400}
            height={200}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg,
                rgba(139,0,0,0.70) 0%,
                rgba(92,0,0,0.80) 50%,
                rgba(212,175,55,0.25) 100%)`,
            }}
          >
            <Building2 className="w-12 h-12" style={{ color: 'rgba(212,175,55,0.80)' }} />
          </div>
        )}
        {/* frosted bottom-fade on banner */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{
            background: 'linear-gradient(to top, rgba(6,6,6,0.70) 0%, transparent 100%)',
          }}
        />
        {community.category && (
          <span
            className="absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: 'rgba(139,0,0,0.40)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(185,28,28,0.40)',
              color: 'rgba(255,160,160,0.95)',
            }}
          >
            {community.category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-cinzel text-lg font-bold text-white mb-1 leading-snug">
          {community.name}
        </h3>

        <p
          className="text-sm mb-4 line-clamp-2 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {community.description}
        </p>

        {/* Meta row */}
        <div
          className="flex items-center gap-3 text-xs mb-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span
            className="flex items-center gap-1"
            style={{ color: 'rgba(255,255,255,0.50)' }}
          >
            <Users className="w-3.5 h-3.5" />
            {community.member_count} anggota
          </span>
          {(community as any).city && (
            <span
              className="flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {(community as any).city}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/community/${community.id}`}
            className="flex-1 text-center text-sm py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.80)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.10)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.80)';
            }}
          >
            Lihat
          </Link>
          {!community.role && (
            <button
              onClick={() => onJoin(community.id)}
              className="flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(185,28,28,0.75) 0%, rgba(139,0,0,0.70) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(185,28,28,0.40)',
                color: '#ffffff',
                boxShadow: '0 2px 16px rgba(139,0,0,0.30)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'linear-gradient(135deg, rgba(196,26,26,0.90) 0%, rgba(185,28,28,0.85) 100%)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 20px rgba(139,0,0,0.50)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'linear-gradient(135deg, rgba(185,28,28,0.75) 0%, rgba(139,0,0,0.70) 100%)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 2px 16px rgba(139,0,0,0.30)';
              }}
            >
              Gabung
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CREATE COMMUNITY MODAL
══════════════════════════════════════════════════════════════ */
function CreateCommunityModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
}: {
  formData: any;
  setFormData: (d: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px) saturate(80%)',
        WebkitBackdropFilter: 'blur(8px) saturate(80%)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(48px) saturate(180%)',
          WebkitBackdropFilter: 'blur(48px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.80), 0 0 40px rgba(139,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Modal header stripe */}
        <div
          className="px-8 py-5 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(139,0,0,0.10)',
          }}
        >
          <h2 className="font-cinzel text-2xl font-bold text-white tracking-wide">
            Buat Komunitas
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.55)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,0,0,0.25)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 py-6 space-y-4">
          <GlassField label="Nama Komunitas *">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input"
              required
            />
          </GlassField>

          <GlassField label="Deskripsi">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input resize-none"
              rows={3}
            />
          </GlassField>

          <GlassField label="Kategori">
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input"
              placeholder="Regional, Bisnis, dll."
            />
          </GlassField>

          <div className="grid grid-cols-2 gap-3">
            <GlassField label="Kota">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="glass-input"
              />
            </GlassField>
            <GlassField label="Provinsi">
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="glass-input"
              />
            </GlassField>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(184,148,31,0.88) 0%, rgba(212,175,55,0.92) 50%, rgba(229,196,83,0.88) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(212,175,55,0.35)',
                color: 'rgba(0,0,0,0.88)',
                boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
              }}
            >
              Buat
            </button>
          </div>
        </form>

        {/* Inline styles for glass inputs inside modal */}
        <style jsx>{`
          .glass-input {
            width: 100%;
            background: rgba(0, 0, 0, 0.28);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 0.625rem;
            padding: 0.625rem 0.875rem;
            color: #ffffff;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s ease;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.50);
          }
          .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.25);
          }
          .glass-input:focus {
            border-color: rgba(139, 0, 0, 0.55);
            background: rgba(0, 0, 0, 0.22);
            box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.40);
          }
        `}</style>
      </div>
    </div>
  );
}

/* Small label wrapper */
function GlassField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5 tracking-wide"
        style={{ color: 'rgba(255,255,255,0.50)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}