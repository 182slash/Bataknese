'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  UserPlus, 
  MessageCircle, 
  Crown,
  Star,
  Shield,
  Award,
  X
} from 'lucide-react';
import { Community, CommunityMember } from '@/lib/types';
import { useAuthStore } from '@/lib/store/authStore';
import ChatRoom from '@/components/community/ChatRoom';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [chatRoomId, setChatRoomId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [newRole, setNewRole] = useState('');

  const isLeader = community?.role === 'leader';
  const isMember = !!community?.role;

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const communityRes = await apiClient.get(`/communities/${communityId}`);
      if (communityRes.data.success) setCommunity(communityRes.data.data);

      const membersRes = await apiClient.get(`/communities/${communityId}/members`);
      if (membersRes.data.success) setMembers(membersRes.data.data.members);

      if (isMember) {
        const chatRes = await apiClient.get(`/chat/community/${communityId}`);
        if (chatRes.data.success) setChatRoomId(chatRes.data.data.id);
      }
    } catch (error) {
      console.error('Failed to fetch community data:', error);
      toast.error('Failed to load community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await apiClient.post(`/communities/${communityId}/join`);
      toast.success('Joined community successfully!');
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this community?')) return;
    try {
      await apiClient.delete(`/communities/${communityId}/leave`);
      toast.success('Left community successfully');
      router.push('/community');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to leave community');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedMember || !newRole) return;
    try {
      await apiClient.put(`/communities/${communityId}/members/${selectedMember.id}/role`, { role: newRole });
      toast.success('Role assigned successfully!');
      setShowRoleModal(false);
      setSelectedMember(null);
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':      return <Crown  className="w-4 h-4 text-gold" />;
      case 'vice_leader': return <Star   className="w-4 h-4 text-gold" />;
      case 'secretary':
      case 'treasurer':   return <Award  className="w-4 h-4 text-primary-light" />;
      case 'supervisor':  return <Shield className="w-4 h-4 text-primary-light" />;
      default:            return null;
    }
  };

  const getRoleBadgeClass = (role: string) =>
    role === 'leader' || role === 'vice_leader' ? 'badge-gold' : 'badge-primary';

  /* ── Loading ──────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner" />
      </div>
    );
  }

  /* ── Not found ────────────────────────────────────────────────── */
  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center">
        <h2 className="font-cinzel text-2xl text-white mb-4">Community not found</h2>
        <button onClick={() => router.push('/community')} className="btn-primary">
          Back to Communities
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="glass-3 border-b border-glass-3 p-6 shrink-0">
        <button
          onClick={() => router.push('/community')}
          className="flex items-center text-white/40 hover:text-white mb-5 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Communities
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Community Avatar */}
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt={community.name}
                width={96}
                height={96}
                className="rounded-xl ring-1 ring-white/10 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 shrink-0 glass-red rounded-xl flex items-center justify-center shadow-glow-red-sm">
                <Users className="w-10 h-10 text-white/70" />
              </div>
            )}

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <h1 className="font-cinzel text-3xl font-bold text-white mb-1">{community.name}</h1>
              <p className="text-white/40 text-sm mb-3 leading-relaxed">{community.description}</p>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <div className="flex items-center text-white/35 gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{community.member_count} members</span>
                </div>
                {community.category && (
                  <span className="badge badge-primary">{community.category}</span>
                )}
                {community.role && (
                  <span className={`badge ${getRoleBadgeClass(community.role)} flex items-center gap-1`}>
                    {getRoleIcon(community.role)}
                    <span className="capitalize">{community.role.replace('_', ' ')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isMember ? (
              <button onClick={handleJoin} className="btn-gold">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Community
              </button>
            ) : (
              <>
                {isLeader && (
                  <button className="btn-secondary">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                )}
                {community.role !== 'leader' && (
                  <button onClick={handleLeave} className="btn-secondary">
                    Leave
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="glass-2 border-b border-glass-2 px-6 shrink-0">
        <div className="flex gap-6">
          {(['chat', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 border-b-2 font-semibold text-sm transition-all flex items-center gap-2
                ${activeTab === tab
                  ? 'border-primary text-white'
                  : 'border-transparent text-white/35 hover:text-white/70'}
              `}
            >
              {tab === 'chat'
                ? <><MessageCircle className="w-4 h-4" />Chat</>
                : <><Users className="w-4 h-4" />Members ({community.member_count})</>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">

        {/* Chat tab */}
        {activeTab === 'chat' && (
          isMember && chatRoomId ? (
            <ChatRoom roomId={chatRoomId} communityName={community.name} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="glass-1 w-24 h-24 rounded-full flex items-center justify-center mb-5">
                <MessageCircle className="w-10 h-10 text-white/25" />
              </div>
              <h3 className="font-cinzel text-2xl text-white mb-2">Join to chat</h3>
              <p className="text-white/40 text-sm mb-6 max-w-xs">
                You need to join this community to participate in the chat
              </p>
              <button onClick={handleJoin} className="btn-gold">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Community
              </button>
            </div>
          )
        )}

        {/* Members tab */}
        {activeTab === 'members' && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="card group">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.full_name}
                        width={52}
                        height={52}
                        className="rounded-full ring-1 ring-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-13 h-13 shrink-0 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center ring-1 ring-white/10">
                        <span className="text-white font-cinzel font-semibold text-base">
                          {member.full_name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{member.full_name}</h4>
                      <p className="text-xs text-gold/80 truncate mb-2">{member.marga}</p>

                      <div className="flex items-center justify-between">
                        <span className={`badge ${getRoleBadgeClass(member.role)} flex items-center gap-1 text-xs`}>
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role.replace('_', ' ')}</span>
                        </span>

                        {isLeader && member.user_id !== user?.id && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setNewRole(member.role);
                              setShowRoleModal(true);
                            }}
                            className="text-xs text-white/30 hover:text-primary-light transition-colors"
                          >
                            Change Role
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Role Assignment Modal ──────────────────────────────── */}
      {showRoleModal && selectedMember && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="modal-panel max-w-md w-full p-8 animate-slide-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-cinzel text-xl font-bold text-white">Assign Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="btn-ghost w-8 h-8 rounded-full p-0 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target member */}
            <div className="glass-inset rounded-lg p-4 mb-6">
              <p className="text-white/40 text-xs mb-1">Assigning role for</p>
              <p className="font-semibold text-white">{selectedMember.full_name}</p>
              <p className="text-sm text-gold/80">{selectedMember.marga}</p>
            </div>

            {/* Role options */}
            <div className="space-y-2 mb-6">
              {['leader', 'vice_leader', 'secretary', 'treasurer', 'supervisor', 'member'].map((role) => (
                <button
                  key={role}
                  onClick={() => setNewRole(role)}
                  className={`
                    w-full p-3 rounded-lg border text-left transition-all duration-200
                    flex items-center gap-2
                    ${newRole === role
                      ? 'glass-red border-primary text-white'
                      : 'glass-0 border-glass-0 text-white/50 hover:border-glass-1 hover:text-white/80'}
                  `}
                >
                  {getRoleIcon(role)}
                  <span className="capitalize text-sm">{role.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setShowRoleModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={handleAssignRole} className="flex-1 btn-gold">
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}