export interface User {
  id: string;
  full_name: string;
  marga: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string;
  age?: number;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  avatar?: string;
  batak_id_card: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category?: string;
  avatar?: string;
  city?: string;
  province?: string;
  created_by: string;
  creator_name?: string;
  member_count: number;
  role?: 'leader' | 'vice_leader' | 'secretary' | 'treasurer' | 'supervisor' | 'member';
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'leader' | 'vice_leader' | 'secretary' | 'treasurer' | 'supervisor' | 'member';
  joined_at: string;
  full_name: string;
  marga: string;
  email: string;
  avatar?: string;
  city?: string;
  province?: string;
}

export interface ChatRoom {
  id: string;
  room_type: 'community' | 'direct';
  community_id?: string;
  participant_1?: string;
  participant_2?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_marga: string;
  sender_avatar?: string;
  message_type: 'text' | 'image';
  content?: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface DMRoom {
  room_id: string;
  other_user_id: string;
  full_name: string;
  marga: string;
  avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface Marga {
  id: number;
  marga_name: string;
  sub_ethnic: string;
}

export interface MargaReference {
  [subEthnic: string]: Array<{
    id: number;
    marga_name: string;
  }>;
}

export interface SearchFilters {
  name?: string;
  marga?: string;
  gender?: string;
  city?: string;
  province?: string;
  min_age?: number;
  max_age?: number;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SocketEvents {
  'room:join': (data: { roomId: string }) => void;
  'room:leave': (data: { roomId: string }) => void;
  'message:send': (data: { roomId: string; content: string; messageType?: string }) => void;
  'message:received': (message: ChatMessage) => void;
  'typing:start': (data: { roomId: string }) => void;
  'typing:stop': (data: { roomId: string }) => void;
  'user:online': (data: { userId: string; full_name: string }) => void;
  'user:offline': (data: { userId: string; full_name: string }) => void;
}
