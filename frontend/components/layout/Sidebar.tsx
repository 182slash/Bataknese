'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  Building2, 
  MessageCircle, 
  LogOut,
  User,
  Crown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Directory', href: '/directory', icon: Users },
  { name: 'Communities', href: '/community', icon: Building2 },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-dark-card border-r border-gray-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-gold rounded-lg flex items-center justify-center shadow-gold">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-white group-hover:text-gold transition-colors">
              Bataknese
            </h1>
            <p className="text-xs text-gray-400 font-inter">Exclusive Community</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.full_name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-primary"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border-2 border-primary">
                  <span className="text-white font-cinzel font-semibold text-lg">
                    {user.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-card rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.full_name}</p>
              <p className="text-gold text-sm truncate">{user.marga}</p>
              <p className="text-gray-400 text-xs truncate">{user.batak_id_card}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-lighter'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-gold rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-lighter transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:text-primary" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Ulos Pattern Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary opacity-50"></div>
    </aside>
  );
}
