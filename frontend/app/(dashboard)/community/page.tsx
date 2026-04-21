'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Building2, Users, Search, X } from 'lucide-react';
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
      console.error('Failed to fetch communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/communities', formData);
      if (response.data.success) {
        toast.success('Community created successfully!');
        setShowCreateModal(false);
        fetchCommunities();
        setFormData({ name: '', description: '', category: '', city: '', province: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create community');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/join`);
      toast.success('Joined community successfully!');
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-4xl font-bold text-white mb-2">Communities</h1>
          <p className="text-gray-400">Discover and join Bataknese communities</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-gold">
          <Plus className="w-5 h-5 mr-2" />
          Create Community
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-primary pl-12"
            placeholder="Search communities..."
          />
        </div>
      </div>

      {/* Communities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-800 rounded mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div key={community.id} className="card group hover:scale-105 transition-transform">
              {community.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-primary to-gold rounded-lg mb-4 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              )}

              <h3 className="font-cinzel text-xl font-bold text-white mb-2">{community.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{community.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{community.member_count} members</span>
                </div>
                {community.category && (
                  <span className="badge badge-primary">{community.category}</span>
                )}
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/community/${community.id}`}
                  className="flex-1 btn-secondary !py-2 text-sm text-center"
                >
                  View
                </Link>
                {!community.role && (
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    className="flex-1 btn-primary !py-2 text-sm"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="ulos-border-card max-w-md w-full">
            <div className="ulos-border-card-inner p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-cinzel text-2xl font-bold text-white">Create Community</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Community Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-primary resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-primary"
                    placeholder="Regional, Business, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="input-primary"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-gold">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
