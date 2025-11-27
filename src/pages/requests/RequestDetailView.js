import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestsAPI } from '../../services/api';
import ApprovalActions from '../../components/forms/ApprovalActions';
import ApprovalSystemDebugger from '../../components/debug/ApprovalSystemDebugger';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PaperClipIcon,
  EyeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const RequestDetailView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await requestsAPI.getRequest(id);
      setRequest(response.data);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load request details. Please try again.');
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
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const canEditRequest = (request) => {
    return (
      request?.status === 'pending' &&
      (user?.role === 'admin' || request.created_by === user?.id)
    );
  };

  const canDeleteRequest = (request) => {
    return (
      request?.status === 'pending' &&
      (user?.role === 'admin' || request.created_by === user?.id)
    );
  };

  const handleEdit = () => {
    navigate(`/dashboard/requests/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await requestsAPI.deleteRequest(id);
        navigate('/dashboard/requests/my');
      } catch (err) {
        setError('Failed to delete request. Please try again.');
      }
    }
  };

  const handleBack = () => {
    // Navigate back to the appropriate list based on user role and current location
    if (user?.role === 'staff') {
      navigate('/dashboard/requests/my');
    } else {
      navigate('/dashboard/requests');
    }
  };

  const handleApprovalComplete = async (approvalType, comments) => {
    // Refresh the request data to show updated status
    await fetchRequest();
    
    // Show success message
    setApprovalSuccess(true);
    setTimeout(() => setApprovalSuccess(false), 5000);
  };

  const canApproveRequest = () => {
    if (!request || request.status !== 'pending') return false;
    
    const userLevel = user?.role === 'admin' ? 999 : 
                     user?.role === 'approver_level_2' ? 2 : 
                     user?.role === 'approver_level_1' ? 1 : 0;
    
    return userLevel > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto p-8">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The requested purchase request could not be found.'}</p>
          <button onClick={handleBack} className="btn-primary">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(request.status);
  const priorityBadge = getPriorityBadge(request.priority);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Requests
        </button>

        <div className="flex items-center space-x-3">
          {/* Approval Actions */}
          {canApproveRequest() && (
            <ApprovalActions
              request={request}
              onApprovalComplete={handleApprovalComplete}
              userRole={user?.role}
            />
          )}

          {canEditRequest(request) && (
            <button onClick={handleEdit} className="btn-outline">
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}

          {canDeleteRequest(request) && (
            <button
              onClick={handleDelete}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {approvalSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-success-400" />
            <div className="ml-3">
              <p className="text-sm text-success-800">
                Request approval processed successfully! The request status has been updated.
              </p>
            </div>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <ApprovalSystemDebugger requestId={id} />
      )}

      {/* Request Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {getStatusIcon(request.status)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              <p className="text-gray-600">Request #{request.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`badge ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <span className={`badge ${priorityBadge.className}`}>
              {priorityBadge.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center text-gray-600">
            <CurrencyDollarIcon className="w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-gray-900">
                ${parseFloat(request.amount || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarIcon className="w-5 h-5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold text-gray-900">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {request.created_by_name && (
            <div className="flex items-center text-gray-600">
              <UserIcon className="w-5 h-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-semibold text-gray-900">{request.created_by_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2" />
          Description
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
      </div>

      {/* Vendor Information */}
      {request.vendor_name && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Vendor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Vendor Name</p>
              <p className="font-medium text-gray-900">{request.vendor_name}</p>
            </div>
            {request.vendor_email && (
              <div>
                <p className="text-sm text-gray-500">Vendor Email</p>
                <p className="font-medium text-gray-900">{request.vendor_email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      {request.items && request.items.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
            Items ({request.items.length})
          </h2>
          <div className="space-y-4">
            {request.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-900">{item.description}</h3>
                    {item.brand && (
                      <p className="text-sm text-gray-600">Brand: {item.brand}</p>
                    )}
                    {item.model && (
                      <p className="text-sm text-gray-600">Model: {item.model}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium text-gray-900">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="font-medium text-gray-900">
                      ${parseFloat(item.unit_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {item.specifications && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Specifications</p>
                    <p className="text-sm text-gray-700">{item.specifications}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proforma */}
        {request.proforma && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <PaperClipIcon className="w-5 h-5 mr-2" />
              Proforma/Quotation
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Proforma Document</p>
                <p className="text-sm text-gray-500">Uploaded with request</p>
              </div>
              <button className="btn-ghost p-2">
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Purchase Order */}
        {request.purchase_order && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Purchase Order
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Purchase Order</p>
                <p className="text-sm text-gray-500">Generated automatically</p>
              </div>
              <button className="btn-ghost p-2">
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approval History - Placeholder */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Timeline</h2>
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Approval timeline will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailView;