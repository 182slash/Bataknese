'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, MessageCircle, MapPin, User as UserIcon } from 'lucide-react';
import { User, MargaReference, SearchFilters } from '@/lib/types';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [margaList, setMargaList] = useState<MargaReference>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    marga: '',
    gender: '',
    city: '',
    province: '',
    min_age: undefined,
    max_age: undefined,
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchMargaList();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters.page]);

  const fetchMargaList = async () => {
    try {
      const response = await apiClient.get('/auth/marga-list');
      if (response.data.success) {
        setMargaList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch marga list:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await apiClient.get(`/users/search?${params.toString()}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchUsers();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      marga: '',
      gender: '',
      city: '',
      province: '',
      min_age: undefined,
      max_age: undefined,
      page: 1,
      limit: 20,
    });
    setTimeout(fetchUsers, 100);
  };

  const createDMRoom = async (userId: string) => {
    try {
      const response = await apiClient.get(`/chat/dm/${userId}`);
      if (response.data.success) {
        window.location.href = `/chat?room=${response.data.data.room.id}`;
      }
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Filter Sidebar */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block w-80 bg-dark-card border-r border-gray-800 overflow-y-auto`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-cinzel text-2xl font-bold text-white">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400">Search and filter members</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="input-primary"
              placeholder="Search by name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Marga</label>
            <select
              value={filters.marga}
              onChange={(e) => setFilters({ ...filters, marga: e.target.value })}
              className="input-primary"
            >
              <option value="">All Marga</option>
              {Object.entries(margaList).map(([subEthnic, margas]) => (
                <optgroup key={subEthnic} label={subEthnic}>
                  {margas.map((marga) => (
                    <option key={marga.id} value={marga.marga_name}>
                      {marga.marga_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="input-primary"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filters.min_age || ''}
                onChange={(e) => setFilters({ ...filters, min_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input-primary"
                placeholder="Min"
              />
              <input
                type="number"
                value={filters.max_age || ''}
                onChange={(e) => setFilters({ ...filters, max_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input-primary"
                placeholder="Max"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="input-primary"
              placeholder="Jakarta, Medan, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Province</label>
            <input
              type="text"
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
              className="input-primary"
              placeholder="DKI Jakarta, etc."
            />
          </div>

          <div className="space-y-3">
            <button onClick={handleSearch} className="btn-primary w-full">
              <Search className="w-4 h-4 mr-2 inline" />
              Apply Filters
            </button>
            <button onClick={handleReset} className="btn-secondary w-full">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-cinzel text-4xl font-bold text-white mb-2">Member Directory</h1>
              <p className="text-gray-400">
                {pagination.total} members found
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-40 bg-gray-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="font-cinzel text-2xl text-white mb-2">No members found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters</p>
              <button onClick={handleReset} className="btn-primary">
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {users.map((user) => (
                  <div key={user.id} className="card group hover:scale-105 transition-transform">
                    <div className="flex flex-col items-center text-center">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.full_name}
                          width={80}
                          height={80}
                          className="rounded-full mb-4 border-2 border-primary"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center mb-4 border-2 border-primary">
                          <span className="text-white font-cinzel font-bold text-2xl">
                            {user.full_name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <h3 className="font-semibold text-lg text-white mb-1">{user.full_name}</h3>
                      <p className="text-gold font-cinzel mb-2">{user.marga}</p>
                      <p className="text-sm text-gray-400 mb-4">{user.batak_id_card}</p>

                      {(user.city || user.province) && (
                        <div className="flex items-center text-sm text-gray-400 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{user.city}{user.city && user.province && ', '}{user.province}</span>
                        </div>
                      )}

                      <div className="flex space-x-2 w-full">
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex-1 btn-secondary !py-2 text-sm"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => createDMRoom(user.id)}
                          className="flex-1 btn-primary !py-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-1 inline" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
