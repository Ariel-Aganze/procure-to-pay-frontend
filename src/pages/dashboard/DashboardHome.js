import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalValue: 0,
    pendingValue: 0,
  });

  const [recentRequests] = useState([
    {
      id: 1,
      title: 'Office Supplies - Q4 2024',
      amount: 1250.00,
      status: 'pending',
      createdAt: '2024-11-20',
      requester: 'John Smith'
    },
    {
      id: 2,
      title: 'Marketing Conference Registration',
      amount: 2500.00,
      status: 'approved',
      createdAt: '2024-11-19',
      requester: 'Sarah Johnson'
    },
    {
      id: 3,
      title: 'Software License Renewal',
      amount: 5000.00,
      status: 'pending',
      createdAt: '2024-11-18',
      requester: 'Mike Wilson'
    },
    {
      id: 4,
      title: 'Team Building Event',
      amount: 800.00,
      status: 'approved',
      createdAt: '2024-11-17',
      requester: 'Lisa Chen'
    },
  ]);

  // Mock stats based on user role
  useEffect(() => {
    const mockStats = {
      staff: {
        totalRequests: 12,
        pendingRequests: 3,
        approvedRequests: 8,
        rejectedRequests: 1,
        totalValue: 15600,
        pendingValue: 4200,
      },
      approver_level_1: {
        totalRequests: 45,
        pendingRequests: 8,
        approvedRequests: 32,
        rejectedRequests: 5,
        totalValue: 125000,
        pendingValue: 18000,
      },
      finance: {
        totalRequests: 156,
        pendingRequests: 12,
        approvedRequests: 128,
        rejectedRequests: 16,
        totalValue: 890000,
        pendingValue: 45000,
      },
      admin: {
        totalRequests: 234,
        pendingRequests: 15,
        approvedRequests: 198,
        rejectedRequests: 21,
        totalValue: 1250000,
        pendingValue: 67000,
      }
    };

    setStats(mockStats[user?.role] || mockStats.staff);
  }, [user?.role]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-success',
      rejected: 'badge-error',
    };
    return badges[status] || 'badge-neutral';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'approved':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';
    
    return `${greeting}, ${user?.first_name}!`;
  };

  const getRoleSpecificStats = () => {
    if (user?.role === 'staff') {
      return [
        {
          name: 'My Requests',
          value: stats.totalRequests,
          change: '+12%',
          changeType: 'increase',
          icon: DocumentTextIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Pending',
          value: stats.pendingRequests,
          change: '+2',
          changeType: 'increase',
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        },
        {
          name: 'Approved',
          value: stats.approvedRequests,
          change: '+5',
          changeType: 'increase',
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          name: 'Total Value',
          value: `$${stats.totalValue.toLocaleString()}`,
          change: '+8.2%',
          changeType: 'increase',
          icon: CurrencyDollarIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
        },
      ];
    }

    if (user?.role?.includes('approver')) {
      return [
        {
          name: 'Total Requests',
          value: stats.totalRequests,
          change: '+15%',
          changeType: 'increase',
          icon: DocumentTextIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Pending My Approval',
          value: stats.pendingRequests,
          change: '+3',
          changeType: 'increase',
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        },
        {
          name: 'Approved This Month',
          value: stats.approvedRequests,
          change: '+12',
          changeType: 'increase',
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          name: 'Total Value',
          value: `$${stats.totalValue.toLocaleString()}`,
          change: '+18.2%',
          changeType: 'increase',
          icon: CurrencyDollarIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
        },
      ];
    }

    if (user?.role === 'finance' || user?.role === 'admin') {
      return [
        {
          name: 'Total Requests',
          value: stats.totalRequests,
          change: '+22%',
          changeType: 'increase',
          icon: DocumentTextIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Active Users',
          value: '156',
          change: '+5',
          changeType: 'increase',
          icon: UserGroupIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        },
        {
          name: 'Monthly Spend',
          value: `$${stats.totalValue.toLocaleString()}`,
          change: '+15.3%',
          changeType: 'increase',
          icon: CurrencyDollarIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          name: 'Processing Time',
          value: '2.4 days',
          change: '-12%',
          changeType: 'decrease',
          icon: ChartBarIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
        },
      ];
    }

    return [];
  };

  const statCards = getRoleSpecificStats();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{getWelcomeMessage()}</h1>
            <p className="text-primary-100">
              Here's what's happening with your procurement today.
            </p>
          </div>
          
          {user?.role === 'staff' && (
            <button
              onClick={() => navigate('/dashboard/requests/create')}
              className="btn bg-white/20 text-white hover:bg-white/30 border-white/30"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Request
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
          
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className={`ml-2 flex items-center text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
              <button
                onClick={() => navigate('/requests')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                
                return (
                  <div key={request.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      <StatusIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        By {request.requester} • {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        ${request.amount.toLocaleString()}
                      </span>
                      <span className={`badge ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {user?.role === 'staff' && (
                <>
                  <button
                    onClick={() => navigate('/dashboard/requests/create')}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Create New Request</p>
                      <p className="text-sm text-gray-500">Submit a new purchase request</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/requests/my')}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">View My Requests</p>
                      <p className="text-sm text-gray-500">Track your submitted requests</p>
                    </div>
                  </button>
                </>
              )}

              {(user?.role?.includes('approver') || user?.role === 'admin') && (
                <button
                  onClick={() => navigate('/dashboard/approvals')}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ClockIcon className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Pending Approvals</p>
                    <p className="text-sm text-gray-500">{stats.pendingRequests} requests awaiting approval</p>
                  </div>
                </button>
              )}

              {(user?.role === 'finance' || user?.role === 'admin') && (
                <>
                  <button
                    onClick={() => navigate('/dashboard/analytics')}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-500">Spending insights and trends</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/requests/approved')}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Approved Requests</p>
                      <p className="text-sm text-gray-500">Review completed requests</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;