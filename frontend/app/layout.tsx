import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Bataknese - Platform Komunitas Batak Eksklusif",
  description: "Platform komunitas sosial premium untuk masyarakat Batak di seluruh dunia",
  keywords: ["Batak", "Komunitas", "Jejaring Sosial", "Indonesia", "Ulos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-inter">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            // ── Default (base glass) ───────────────────────────
            style: {
              background: 'rgba(10, 4, 4, 0.82)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              color: 'rgba(255, 255, 255, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-inter)',
              padding: '0.75rem 1rem',
            },
            // ── Success — green-tinted glass ──────────────────
            success: {
              style: {
                background: 'rgba(4, 14, 8, 0.84)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                color: '#4ADE80',
                border: '1px solid rgba(74, 222, 128, 0.22)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(74,222,128,0.08)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-inter)',
                padding: '0.75rem 1rem',
              },
              iconTheme: {
                primary: '#4ADE80',
                secondary: 'rgba(4, 14, 8, 0.90)',
              },
            },
            // ── Error — crimson-tinted glass ──────────────────
            error: {
              style: {
                background: 'rgba(10, 2, 2, 0.84)',
                backdropFilter: 'blur(28px) saturate(160%)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                color: '#F07070',
                border: '1px solid rgba(139, 0, 0, 0.32)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 0 20px rgba(139,0,0,0.12), inset 0 1px 0 rgba(139,0,0,0.08)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-inter)',
                padding: '0.75rem 1rem',
              },
              iconTheme: {
                primary: '#F07070',
                secondary: 'rgba(10, 2, 2, 0.90)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}