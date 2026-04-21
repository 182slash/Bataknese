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
      // Determine dimensions
      const dimensions = {
        'instagram-post': { width: 1080, height: 1080 },
        'instagram-story': { width: 1080, height: 1920 },
        'whatsapp': { width: 1080, height: 1080 },
      };

      const { width, height } = dimensions[format];

      // Create canvas from element
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0F0F0F',
        scale: 3,
        logging: false,
        useCORS: true,
      });

      // Create new canvas with target dimensions
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        // Fill background
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(0, 0, width, height);

        // Calculate positioning to center the card
        const cardAspect = canvas.width / canvas.height;
        const targetAspect = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (format === 'instagram-story') {
          // For story, center the card vertically
          drawWidth = width * 0.9;
          drawHeight = drawWidth / cardAspect;
          offsetX = (width - drawWidth) / 2;
          offsetY = (height - drawHeight) / 2;
        } else {
          // For post, fit to square
          if (cardAspect > targetAspect) {
            drawHeight = width / cardAspect;
            offsetY = (height - drawHeight) / 2;
          } else {
            drawWidth = height * cardAspect;
            offsetX = (width - drawWidth) / 2;
          }
        }

        // Draw card
        ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

        // Add watermark
        ctx.font = '24px Inter';
        ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('Bataknese Community', width / 2, height - 40);
      }

      // Convert to blob and download
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
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
      {/* ID Card */}
      <div ref={cardRef} className="w-full max-w-md mx-auto">
        <div className="ulos-border-card">
          <div className="ulos-border-card-inner p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 ulos-pattern opacity-30"></div>
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="font-cinzel text-2xl font-bold text-gold">
                  BATAK ID CARD
                </h3>
                <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              </div>

              {/* Photo and Info */}
              <div className="flex items-start space-x-6">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.full_name}
                      width={120}
                      height={120}
                      className="rounded-lg border-4 border-primary shadow-lg"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] rounded-lg border-4 border-primary bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <span className="text-white font-cinzel font-bold text-4xl">
                        {user.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Full Name</p>
                    <p className="text-white font-semibold text-lg">{user.full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Marga</p>
                    <p className="text-gold font-cinzel font-semibold text-xl">{user.marga}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                    <p className="text-white">{user.gender}</p>
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div className="bg-dark-lighter rounded-lg p-4 border border-primary/30">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Card Number</p>
                <p className="font-mono text-2xl font-bold text-primary tracking-wider">
                  {user.batak_id_card}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {user.city && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">City</p>
                    <p className="text-white">{user.city}</p>
                  </div>
                )}
                {user.province && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Province</p>
                    <p className="text-white">{user.province}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-center text-gray-400">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold opacity-50"></div>
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold opacity-50"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold opacity-50"></div>
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      {showShareButtons && (
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <Share2 className="w-4 h-4 text-gold" />
            <p className="text-sm text-gray-400">Share your Batak ID</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => exportAsImage('instagram-post')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-2 disabled:opacity-50"
            >
              <Instagram className="w-5 h-5 text-primary" />
              <span className="text-xs">IG Post</span>
              <span className="text-xs text-gray-500">1080x1080</span>
            </button>
            
            <button
              onClick={() => exportAsImage('instagram-story')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-2 disabled:opacity-50"
            >
              <Instagram className="w-5 h-5 text-gold" />
              <span className="text-xs">IG Story</span>
              <span className="text-xs text-gray-500">1080x1920</span>
            </button>
            
            <button
              onClick={() => exportAsImage('whatsapp')}
              disabled={isExporting}
              className="btn-secondary flex flex-col items-center justify-center py-3 space-y-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
              <span className="text-xs text-gray-500">Square</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
