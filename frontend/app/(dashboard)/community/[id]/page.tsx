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
      // Fetch community details
      const communityRes = await apiClient.get(`/communities/${communityId}`);
      if (communityRes.data.success) {
        setCommunity(communityRes.data.data);
      }

      // Fetch members
      const membersRes = await apiClient.get(`/communities/${communityId}/members`);
      if (membersRes.data.success) {
        setMembers(membersRes.data.data.members);
      }

      // Fetch chat room if member
      if (isMember) {
        const chatRes = await apiClient.get(`/chat/community/${communityId}`);
        if (chatRes.data.success) {
          setChatRoomId(chatRes.data.data.id);
        }
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
      await apiClient.put(`/communities/${communityId}/members/${selectedMember.id}/role`, {
        role: newRole,
      });
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
      case 'leader':
        return <Crown className="w-4 h-4 text-gold" />;
      case 'vice_leader':
        return <Star className="w-4 h-4 text-gold" />;
      case 'secretary':
      case 'treasurer':
        return <Award className="w-4 h-4 text-primary" />;
      case 'supervisor':
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === 'leader' || role === 'vice_leader') return 'badge-gold';
    return 'badge-primary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

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
      {/* Header */}
      <div className="bg-dark-card border-b border-gray-800 p-6">
        <button
          onClick={() => router.push('/community')}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Communities
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt={community.name}
                width={100}
                height={100}
                className="rounded-lg"
              />
            ) : (
              <div className="w-[100px] h-[100px] bg-gradient-to-br from-primary to-gold rounded-lg flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-cinzel text-3xl font-bold text-white mb-2">{community.name}</h1>
              <p className="text-gray-400 mb-3">{community.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{community.member_count} members</span>
                </div>
                {community.category && (
                  <span className="badge badge-primary">{community.category}</span>
                )}
                {community.role && (
                  <span className={`badge ${getRoleBadgeClass(community.role)} flex items-center`}>
                    {getRoleIcon(community.role)}
                    <span className="ml-1 capitalize">{community.role.replace('_', ' ')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isMember ? (
              <button onClick={handleJoin} className="btn-gold">
                <UserPlus className="w-5 h-5 mr-2" />
                Join Community
              </button>
            ) : (
              <>
                {isLeader && (
                  <button className="btn-secondary">
                    <Settings className="w-5 h-5 mr-2" />
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

      {/* Tabs */}
      <div className="bg-dark-card border-b border-gray-800 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'members'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Members ({community.member_count})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          isMember && chatRoomId ? (
            <ChatRoom roomId={chatRoomId} communityName={community.name} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-20 h-20 text-gray-600 mb-4" />
              <h3 className="font-cinzel text-2xl text-white mb-2">Join to chat</h3>
              <p className="text-gray-400 mb-6">You need to join this community to participate in the chat</p>
              <button onClick={handleJoin} className="btn-gold">
                <UserPlus className="w-5 h-5 mr-2" />
                Join Community
              </button>
            </div>
          )
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="card">
                  <div className="flex items-start space-x-4">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.full_name}
                        width={56}
                        height={56}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                        <span className="text-white font-cinzel font-semibold text-lg">
                          {member.full_name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{member.full_name}</h4>
                      <p className="text-sm text-gold truncate">{member.marga}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`badge ${getRoleBadgeClass(member.role)} flex items-center text-xs`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role.replace('_', ' ')}</span>
                        </span>
                        
                        {isLeader && member.user_id !== user?.id && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setNewRole(member.role);
                              setShowRoleModal(true);
                            }}
                            className="text-xs text-primary hover:text-primary-light"
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

      {/* Role Assignment Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="ulos-border-card max-w-md w-full">
            <div className="ulos-border-card-inner p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-cinzel text-xl font-bold text-white">Assign Role</h3>
                <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 mb-2">Assign role for:</p>
                <p className="font-semibold text-white">{selectedMember.full_name}</p>
                <p className="text-sm text-gold">{selectedMember.marga}</p>
              </div>

              <div className="space-y-3 mb-6">
                {['leader', 'vice_leader', 'secretary', 'treasurer', 'supervisor', 'member'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      newRole === role
                        ? 'border-primary bg-primary/20 text-white'
                        : 'border-gray-700 bg-dark-lighter text-gray-400 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center">
                      {getRoleIcon(role)}
                      <span className="ml-2 capitalize">{role.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRole}
                  className="flex-1 btn-gold"
                >
                  Assign Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
