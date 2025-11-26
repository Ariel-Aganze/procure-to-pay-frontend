import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';
import ApprovalActions from '../../components/forms/ApprovalActions';
import {
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

const PendingApprovalsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(null);

  const amountRanges = [
    { value: 'all', label: 'All Amounts' },
    { value: '0-1000', label: 'Under $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000+', label: 'Over $10,000' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  useEffect(() => {
    fetchPendingApprovals();
  }, [searchQuery, amountFilter, priorityFilter]);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await requestsAPI.getPendingApprovals();
      let filteredRequests = response.data.results || response.data || [];

      // Apply client-side filters
      if (searchQuery) {
        filteredRequests = filteredRequests.filter(request =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (amountFilter !== 'all') {
        filteredRequests = filteredRequests.filter(request => {
          const amount = parseFloat(request.amount || 0);
          switch (amountFilter) {
            case '0-1000':
              return amount < 1000;
            case '1000-5000':
              return amount >= 1000 && amount < 5000;
            case '5000-10000':
              return amount >= 5000 && amount < 10000;
            case '10000+':
              return amount >= 10000;
            default:
              return true;
          }
        });
      }

      if (priorityFilter !== 'all') {
        filteredRequests = filteredRequests.filter(request =>
          request.priority === priorityFilter
        );
      }

      setRequests(filteredRequests);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError('Failed to load pending approvals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = async (requestId, approvalType, comments) => {
    // Remove the request from the list since it's no longer pending
    setRequests(prevRequests => 
      prevRequests.filter(request => request.id !== requestId)
    );
    
    // Show success message
    setApprovalSuccess({
      type: approvalType,
      requestId: requestId
    });
    setTimeout(() => setApprovalSuccess(null), 5000);
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

  const getApprovalLevel = (amount) => {
    const amt = parseFloat(amount || 0);
    if (amt <= 1000) return 'Level 1';
    return 'Level 1 & 2';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-2 text-gray-600">
          Review and approve purchase requests awaiting your decision.
        </p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-error-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {approvalSuccess && (
        <div className={`border rounded-lg p-4 ${
          approvalSuccess.type === 'approve' 
            ? 'bg-success-50 border-success-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex">
            <CheckCircleIcon className={`h-5 w-5 ${
              approvalSuccess.type === 'approve' ? 'text-success-400' : 'text-orange-400'
            }`} />
            <div className="ml-3">
              <p className={`text-sm ${
                approvalSuccess.type === 'approve' ? 'text-success-800' : 'text-orange-800'
              }`}>
                Request #{approvalSuccess.requestId} has been {approvalSuccess.type}d successfully!
              </p>
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
              onClick={fetchPendingApprovals}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="input"
                >
                  {amountRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Showing Results
                </label>
                <div className="input bg-gray-50 text-gray-700 flex items-center">
                  {requests.length} request{requests.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <InboxIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
          <p className="text-gray-600">
            All requests have been processed or there are no requests awaiting your approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Request Cards */}
          <div className="grid gap-6">
            {requests.map((request) => {
              const priorityBadge = getPriorityBadge(request.priority);
              
              return (
                <div key={request.id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <ClockIcon className="w-5 h-5 text-yellow-500" />
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {request.title}
                          </h3>
                          <span className={`badge ${priorityBadge.className}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {request.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-semibold text-gray-900">
                                ${parseFloat(request.amount || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <UserIcon className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Requested By</p>
                              <p className="font-medium text-gray-900">
                                {request.created_by_name || 'Unknown'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Approval Level</p>
                              <p className="font-medium text-gray-900">
                                {getApprovalLevel(request.amount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {request.vendor_name && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Vendor</p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.vendor_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => navigate(`/dashboard/requests/${request.id}/view`)}
                          className="btn-ghost p-2 flex items-center"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </button>

                        <ApprovalActions
                          request={request}
                          onApprovalComplete={(approvalType, comments) => 
                            handleApprovalComplete(request.id, approvalType, comments)
                          }
                          userRole={user?.role}
                        />
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

export default PendingApprovalsPage;