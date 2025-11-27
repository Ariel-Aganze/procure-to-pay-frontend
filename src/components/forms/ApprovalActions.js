import React, { useState } from 'react';
import { requestsAPI } from '../../services/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ApprovalActions = ({ request, onApprovalComplete, userRole }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState(null); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const canApprove = () => {
    if (!request || request.status !== 'pending') {
      setDebugInfo(`Cannot approve: status=${request?.status}`);
      return false;
    }
    
    // Updated logic to match backend better
    const userLevel = getUserApprovalLevel(userRole);
    
    // Check if user can approve at all
    if (userLevel === 0) {
      setDebugInfo(`Cannot approve: userLevel=0 for role=${userRole}`);
      return false;
    }

    // For debugging: show current approval state
    console.log('Approval check:', {
      requestId: request.id,
      userRole,
      userLevel,
      requestAmount: request.amount,
      requiredLevels: request.required_approval_levels,
      currentApprovals: request.approvals,
      canApproveFromBackend: request.can_approve
    });

    // Use backend-provided can_approve if available (most reliable)
    if (request.can_approve !== undefined) {
      setDebugInfo(`Backend can_approve: ${request.can_approve}`);
      return request.can_approve;
    }

    // Fallback to frontend logic
    const requiredLevels = request.required_approval_levels || getRequiredLevelsForAmount(request.amount);
    const approvedLevels = new Set(
      (request.approvals || [])
        .filter(approval => approval.approved)
        .map(approval => approval.approval_level)
    );

    // Find next level that needs approval
    const pendingLevels = requiredLevels.filter(level => !approvedLevels.has(level));
    const nextLevel = Math.min(...pendingLevels);

    const canApproveAtLevel = userLevel >= nextLevel || userLevel === 999; // Admin can approve any level
    
    setDebugInfo(`Frontend check: userLevel=${userLevel}, nextLevel=${nextLevel}, canApprove=${canApproveAtLevel}`);
    return canApproveAtLevel;
  };

  const getUserApprovalLevel = (role) => {
    switch (role) {
      case 'admin': return 999;
      case 'approver_level_2': return 2;
      case 'approver_level_1': return 1;
      default: return 0;
    }
  };

  const getRequiredLevelsForAmount = (amount) => {
    const amt = parseFloat(amount || 0);
    if (amt <= 1000) return [1];
    return [1, 2];
  };

  const handleApprovalClick = (type) => {
    setApprovalType(type);
    setShowApprovalModal(true);
    setComments('');
    setError('');
    setDebugInfo('');
  };

  const handleSubmitApproval = async () => {
    if (!comments.trim() && approvalType === 'reject') {
      setError('Comments are required when rejecting a request.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setDebugInfo('Submitting approval...');

    try {
      const approvalData = {
        approved: approvalType === 'approve',
        comments: comments.trim() || null,
      };

      console.log('Submitting approval:', {
        requestId: request.id,
        approvalData,
        userRole,
        requestStatus: request.status
      });

      const response = await requestsAPI.approveRequest(request.id, approvalData);
      
      console.log('Approval response:', response.data);
      
      // Close modal and notify parent component
      setShowApprovalModal(false);
      if (onApprovalComplete) {
        onApprovalComplete(request.id, approvalType, comments);
      }

    } catch (err) {
      console.error('Approval error details:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        requestId: request.id,
        userRole,
        approvalData: {
          approved: approvalType === 'approve',
          comments: comments.trim() || null,
        }
      });
      
      let errorMessage = 'Failed to process approval. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle different error response formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field][0]}`);
            } else if (typeof errorData[field] === 'string') {
              fieldErrors.push(`${field}: ${errorData[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
        }
      }
      
      // Add debug information for development
      const debugDetails = process.env.NODE_ENV === 'development' 
        ? `\n\nDebug: ${err.response?.status} - ${err.response?.statusText}\nUser Role: ${userRole}\nRequest ID: ${request.id}\nRequest Status: ${request.status}`
        : '';
      
      setError(errorMessage + debugDetails);
      setDebugInfo(`Error: ${err.response?.status || 'Unknown'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setApprovalType(null);
    setComments('');
    setError('');
    setDebugInfo('');
  };

  if (!canApprove()) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleApprovalClick('approve')}
        className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        <CheckCircleIcon className="w-4 h-4 mr-2" />
        Approve
      </button>

      <button
        onClick={() => handleApprovalClick('reject')}
        className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        <XCircleIcon className="w-4 h-4 mr-2" />
        Reject
      </button>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {approvalType === 'approve' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
                )}
                <h3 className="text-lg font-medium">
                  {approvalType === 'approve' ? 'Approve Request' : 'Reject Request'}
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                {approvalType === 'approve'
                  ? 'Are you sure you want to approve this purchase request?'
                  : 'Are you sure you want to reject this purchase request?'}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {approvalType === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="input"
                  placeholder={approvalType === 'approve' 
                    ? 'Optional comments...' 
                    : 'Please provide reason for rejection (required)'}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                    <div className="text-sm text-red-800 whitespace-pre-line">{error}</div>
                  </div>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && debugInfo && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  Debug: {debugInfo}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitApproval}
                  disabled={isSubmitting || (approvalType === 'reject' && !comments.trim())}
                  className={approvalType === 'approve' 
                    ? 'btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                    : 'btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'}
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    approvalType === 'approve' ? 'Approve' : 'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalActions;