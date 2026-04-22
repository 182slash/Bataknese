'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { Download, Share2, Instagram } from 'lucide-react';
import { User } from '@/lib/types';
import toast from 'react-hot-toast';

interface BatakIDCardProps {
  user: User;
  showShareButtons?: boolean;
}

export default function BatakIDCard({ user, showShareButtons = true }: BatakIDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async (format: 'instagram-post' | 'instagram-story' | 'whatsapp') => {
    if (!cardRef.current) return;

    setIsExporting(true);
    toast.loading('Generating image...', { id: 'export' });

    try {
      const dimensions = {
        'instagram-post':  { width: 1080, height: 1080 },
        'instagram-story': { width: 1080, height: 1920 },
        'whatsapp':        { width: 1080, height: 1080 },
      };

      const { width, height } = dimensions[format];

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',   // updated to true black
        scale: 3,
        logging: false,
        useCORS: true,
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width  = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const cardAspect   = canvas.width / canvas.height;
        const targetAspect = width / height;

        let drawWidth  = width;
        let drawHeight = height;
        let offsetX    = 0;
        let offsetY    = 0;

        if (format === 'instagram-story') {
          drawWidth  = width * 0.9;
          drawHeight = drawWidth / cardAspect;
          offsetX    = (width  - drawWidth)  / 2;
          offsetY    = (height - drawHeight) / 2;
        } else {
          if (cardAspect > targetAspect) {
            drawHeight = width / cardAspect;
            offsetY    = (height - drawHeight) / 2;
          } else {
            drawWidth = height * cardAspect;
            offsetX   = (width - drawWidth) / 2;
          }
        }

        ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

        ctx.font      = '24px Inter';
        ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('Bataknese Community', width / 2, height - 40);
      }

      finalCanvas.toBlob((blob) => {
        if (blob) {
          const url  = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href     = url;
          link.download = `batak-id-${user.batak_id_card}-${format}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Image downloaded successfully!', { id: 'export' });
        }
      }, 'image/png');

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── ID Card ────────────────────────────────────────────── */}
      <div ref={cardRef} className="w-full max-w-md mx-auto">
        <div className="ulos-border-card">
          <div
            className="ulos-border-card-inner p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(139,0,0,0.08) 100%)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            }}
          >
            {/* Background ulos pattern */}
            <div className="absolute inset-0 ulos-pattern opacity-20 pointer-events-none" />

            {/* Top-left ambient red glow */}
            <div
              className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.35) 0%, transparent 70%)', filter: 'blur(24px)' }}
            />

            {/* Content */}
            <div className="relative z-10 space-y-6">

              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="font-cinzel text-2xl font-bold tracking-widest" style={{ color: '#D4AF37' }}>
                  BATAK ID CARD
                </h3>
                <div
                  className="h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                />
              </div>

              {/* Photo + Info */}
              <div className="flex items-start space-x-6">

                {/* Photo */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.full_name}
                      width={120}
                      height={120}
                      className="rounded-xl"
                      style={{
                        border: '3px solid #8B0000',
                        boxShadow: '0 0 20px rgba(139,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
                      }}
                    />
                  ) : (
                    <div
                      className="w-[120px] h-[120px] rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #8B0000 0%, #5C0000 100%)',
                        border: '3px solid rgba(139,0,0,0.80)',
                        boxShadow: '0 0 24px rgba(139,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                      }}
                    >
                      <span className="text-white font-cinzel font-bold text-4xl">
                        {user.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info fields */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Full Name
                    </p>
                    <p className="text-white font-semibold text-lg leading-tight">{user.full_name}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Marga
                    </p>
                    <p className="font-cinzel font-semibold text-xl" style={{ color: '#D4AF37' }}>{user.marga}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Gender
                    </p>
                    <p className="text-white">{user.gender}</p>
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(139,0,0,0.45)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Card Number
                </p>
                <p
                  className="font-mono text-2xl font-bold tracking-wider"
                  style={{ color: '#B91C1C', textShadow: '0 0 12px rgba(139,0,0,0.60)' }}
                >
                  {user.batak_id_card}
                </p>
              </div>

              {/* City / Province */}
              {(user.city || user.province) && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {user.city && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        City
                      </p>
                      <p className="text-white">{user.city}</p>
                    </div>
                  )}
                  {user.province && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Province
                      </p>
                      <p className="text-white">{user.province}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div
                className="pt-4 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-2 left-2  w-8 h-8 border-t-2 border-l-2 border-gold opacity-40 pointer-events-none" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold opacity-40 pointer-events-none" />
            <div className="absolute bottom-2 left-2  w-8 h-8 border-b-2 border-l-2 border-gold opacity-40 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold opacity-40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Share Buttons ──────────────────────────────────────── */}
      {showShareButtons && (
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <Share2 className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>Share your Batak ID</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => exportAsImage('instagram-post')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-1 disabled:opacity-50"
            >
              <Instagram className="w-5 h-5 text-primary-light" />
              <span className="text-xs text-white">IG Post</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>1080×1080</span>
            </button>

            <button
              onClick={() => exportAsImage('instagram-story')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-1 disabled:opacity-50"
            >
              <Instagram className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <span className="text-xs text-white">IG Story</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>1080×1920</span>
            </button>

            <button
              onClick={() => exportAsImage('whatsapp')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-1 disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-green-500" />
              <span className="text-xs text-white">WhatsApp</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>Square</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}