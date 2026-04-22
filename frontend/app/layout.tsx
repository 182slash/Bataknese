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
            style: {
              background: '#171717',
              color: '#E5E5E5',
              border: '1px solid rgba(185, 28, 28, 0.3)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#171717',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#171717',
              },
            },
          }}
        />
      </body>
    </html>
  );
}