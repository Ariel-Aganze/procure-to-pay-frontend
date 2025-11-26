import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';
import {
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const RequestList = ({ variant = 'all' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'amount', label: 'Amount' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
  ];

  useEffect(() => {
    fetchRequests();
  }, [variant, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      const params = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        ordering: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
      };

      switch (variant) {
        case 'my':
          response = await requestsAPI.getMyRequests();
          break;
        case 'pending-approvals':
          response = await requestsAPI.getPendingApprovals();
          break;
        case 'approved':
          response = await requestsAPI.getFinanceRequests();
          break;
        default:
          response = await requestsAPI.getRequests(params);
      }

      setRequests(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: 'badge-pending', label: 'Pending' },
      approved: { className: 'badge-success', label: 'Approved' },
      rejected: { className: 'badge-error', label: 'Rejected' },
    };
    return badges[status] || { className: 'badge-neutral', label: status };
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { className: 'text-blue-600 bg-blue-100', label: 'Low' },
      medium: { className: 'text-yellow-600 bg-yellow-100', label: 'Medium' },
      high: { className: 'text-orange-600 bg-orange-100', label: 'High' },
      urgent: { className: 'text-red-600 bg-red-100', label: 'Urgent' },
    };
    return badges[priority] || { className: 'text-gray-600 bg-gray-100', label: priority };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewRequest = (requestId) => {
    navigate(`/dashboard/requests/${requestId}/view`);
  };

  const handleEditRequest = (requestId) => {
    navigate(`/dashboard/requests/${requestId}/edit`);
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await requestsAPI.deleteRequest(requestId);
        await fetchRequests(); // Refresh the list
      } catch (err) {
        setError('Failed to delete request. Please try again.');
      }
    }
  };

  const getPageTitle = () => {
    switch (variant) {
      case 'my':
        return 'My Requests';
      case 'pending-approvals':
        return 'Pending Approvals';
      case 'approved':
        return 'Approved Requests';
      default:
        return 'All Requests';
    }
  };

  const getPageDescription = () => {
    switch (variant) {
      case 'my':
        return 'Track and manage your submitted purchase requests.';
      case 'pending-approvals':
        return 'Review and approve purchase requests awaiting your approval.';
      case 'approved':
        return 'View all approved purchase requests ready for processing.';
      default:
        return 'View and manage all purchase requests in the system.';
    }
  };

  const canEditRequest = (request) => {
    return (
      request.status === 'pending' &&
      (user?.role === 'admin' || request.created_by === user?.id)
    );
  };

  const canDeleteRequest = (request) => {
    return (
      request.status === 'pending' &&
      (user?.role === 'admin' || request.created_by === user?.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="mt-2 text-gray-600">{getPageDescription()}</p>
        </div>
        
        {variant === 'my' && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/dashboard/requests/create')}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              <ChevronDownIcon className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={fetchRequests}
              className="btn-ghost"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-6">
            {variant === 'my' 
              ? "You haven't submitted any requests yet."
              : "No requests match your current filters."
            }
          </p>
          {variant === 'my' && (
            <button
              onClick={() => navigate('/dashboard/requests/create')}
              className="btn-primary"
            >
              Create Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
          </div>

          {/* Request Cards */}
          <div className="grid gap-4">
            {requests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const priorityBadge = getPriorityBadge(request.priority);
              
              return (
                <div key={request.id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {request.title}
                          </h3>
                          <span className={`badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          <span className={`badge ${priorityBadge.className}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {request.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                            <span className="font-medium text-gray-900">
                              ${parseFloat(request.amount || 0).toLocaleString()}
                            </span>
                          </div>

                          {request.vendor_name && (
                            <div className="flex items-center text-gray-600">
                              <UserIcon className="w-4 h-4 mr-2" />
                              <span>{request.vendor_name}</span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            <span>
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {variant !== 'my' && request.created_by_name && (
                            <div className="flex items-center text-gray-600">
                              <UserIcon className="w-4 h-4 mr-2" />
                              <span>By {request.created_by_name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="btn-ghost p-2"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {canEditRequest(request) && (
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="btn-ghost p-2 text-blue-600 hover:text-blue-700"
                            title="Edit Request"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}

                        {canDeleteRequest(request) && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="btn-ghost p-2 text-red-600 hover:text-red-700"
                            title="Delete Request"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;