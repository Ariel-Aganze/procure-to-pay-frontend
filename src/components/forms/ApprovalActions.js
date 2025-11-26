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

  const canApprove = () => {
    if (!request || request.status !== 'pending') return false;
    
    // Check if user has appropriate approval level
    const requiredLevels = request.required_approval_levels || [];
    const userLevel = userRole === 'admin' ? 999 : 
                     userRole === 'approver_level_2' ? 2 : 
                     userRole === 'approver_level_1' ? 1 : 0;
    
    return userLevel > 0 && requiredLevels.some(level => userLevel >= level);
  };

  const handleApprovalClick = (type) => {
    setApprovalType(type);
    setShowApprovalModal(true);
    setComments('');
    setError('');
  };

  const handleSubmitApproval = async () => {
    if (!comments.trim() && approvalType === 'reject') {
      setError('Comments are required when rejecting a request.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const approvalData = {
        approved: approvalType === 'approve',
        comments: comments.trim() || null,
      };

      await requestsAPI.approveRequest(request.id, approvalData);
      
      // Close modal and notify parent component
      setShowApprovalModal(false);
      if (onApprovalComplete) {
        onApprovalComplete(approvalType, comments);
      }

    } catch (err) {
      console.error('Approval error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to process approval. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setShowApprovalModal(false);
      setComments('');
      setError('');
      setApprovalType(null);
    }
  };

  if (!canApprove()) {
    return null;
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => handleApprovalClick('approve')}
          className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
          disabled={isSubmitting}
        >
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          Approve
        </button>
        
        <button
          onClick={() => handleApprovalClick('reject')}
          className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
          disabled={isSubmitting}
        >
          <XCircleIcon className="w-4 h-4 mr-2" />
          Reject
        </button>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    approvalType === 'approve' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {approvalType === 'approve' ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                      {approvalType === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </h3>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Request: <span className="font-medium text-gray-900">{request.title}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: <span className="font-medium text-gray-900">
                          ${parseFloat(request.amount || 0).toLocaleString()}
                        </span>
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="approval-comments" className="block text-sm font-medium text-gray-700 mb-2">
                        Comments {approvalType === 'reject' && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <textarea
                          id="approval-comments"
                          rows={4}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="input"
                          placeholder={
                            approvalType === 'approve'
                              ? 'Add any approval notes or conditions (optional)...'
                              : 'Please explain the reason for rejection...'
                          }
                          disabled={isSubmitting}
                        />
                        <div className="absolute bottom-2 right-2">
                          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      {approvalType === 'reject' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Comments are required when rejecting a request
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitApproval}
                  disabled={isSubmitting || (approvalType === 'reject' && !comments.trim())}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                    approvalType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `${approvalType === 'approve' ? 'Approve' : 'Reject'} Request`
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalActions;