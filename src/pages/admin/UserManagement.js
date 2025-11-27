import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import CreateUserModal from '../../components/forms/CreateUserModal';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'staff', label: 'Staff' },
    { value: 'approver_level_1', label: 'Approver Level 1' },
    { value: 'approver_level_2', label: 'Approver Level 2' },
    { value: 'finance', label: 'Finance' },
    { value: 'admin', label: 'Administrator' },
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.getUsers();
      let allUsers = response.data.results || response.data || [];

      // Apply filters
      if (searchQuery) {
        allUsers = allUsers.filter(user =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (roleFilter !== 'all') {
        allUsers = allUsers.filter(user => user.role === roleFilter);
      }

      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      
      // Fallback mock data for demo - this should be replaced with proper error handling
      setUsers([
        {
          id: 1,
          username: 'staff',
          email: 'staff@company.com',
          first_name: 'John',
          last_name: 'Staff',
          role: 'staff',
          is_active: true,
          date_joined: '2024-01-15'
        },
        {
          id: 2,
          username: 'approver',
          email: 'approver@company.com',
          first_name: 'Jane',
          last_name: 'Approver',
          role: 'approver_level_1',
          is_active: true,
          date_joined: '2024-01-10'
        },
        {
          id: 3,
          username: 'finance',
          email: 'finance@company.com',
          first_name: 'Bob',
          last_name: 'Finance',
          role: 'finance',
          is_active: true,
          date_joined: '2024-01-05'
        },
        {
          id: 4,
          username: 'admin',
          email: 'admin@company.com',
          first_name: 'Alice',
          last_name: 'Admin',
          role: 'admin',
          is_active: true,
          date_joined: '2024-01-01'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      staff: { className: 'badge bg-blue-100 text-blue-800', label: 'Staff' },
      approver_level_1: { className: 'badge bg-green-100 text-green-800', label: 'Approver L1' },
      approver_level_2: { className: 'badge bg-green-100 text-green-800', label: 'Approver L2' },
      finance: { className: 'badge bg-purple-100 text-purple-800', label: 'Finance' },
      admin: { className: 'badge bg-red-100 text-red-800', label: 'Admin' },
    };
    return badges[role] || { className: 'badge-neutral', label: role };
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // await authAPI.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You need administrator privileges to access user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage users and their roles in the procurement system.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-error-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <button
              onClick={fetchUsers}
              className="btn-ghost"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({users.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchQuery || roleFilter !== 'all' 
                ? "No users match your current filters."
                : "No users have been created yet."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={roleBadge.className}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-primary-600 hover:text-primary-700"
                            title="Edit User"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {user.id !== user?.id && ( // Can't delete yourself
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete User"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserCreated={(newUser) => {
          // Add the new user to the list
          setUsers(prevUsers => [newUser, ...prevUsers]);
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default UserManagement;