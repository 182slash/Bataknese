import { create } from 'zustand';
import { User } from '@/lib/types';
import apiClient, { setAuthToken, removeAuthToken } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: FormData) => Promise<boolean>;
  setUser: (user: User) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Gagal mengurai data pengguna:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        toast.success('Login berhasil!');
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login gagal';
      toast.error(message);
      return false;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/register', data);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        toast.success('Pendaftaran berhasil!');
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Pendaftaran gagal';
      toast.error(message);
      return false;
    }
  },

  logout: () => {
    removeAuthToken();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
    toast.success('Berhasil keluar');
    
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  updateProfile: async (formData: FormData) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        set({ 
          user: updatedUser,
          isLoading: false 
        });
        
        toast.success('Profil berhasil diperbarui!');
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Pembaruan gagal';
      toast.error(message);
      return false;
    }
  },

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },
}));