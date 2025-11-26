import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const RequestEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to load request for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/dashboard/requests/${id}/view`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading request for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Request Details
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Edit Purchase Request</h1>
        <p className="mt-2 text-gray-600">
          Modify your purchase request details. Note: Only pending requests can be edited.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {request && request.status !== 'pending' && (
        <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
          <p className="text-warning-800">
            This request cannot be edited because it has already been {request.status}.
          </p>
        </div>
      )}

      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Form Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          The edit functionality will be implemented here. For now, you can view the request details.
        </p>
        <button
          onClick={handleBack}
          className="btn-primary"
        >
          Back to Request Details
        </button>
      </div>
    </div>
  );
};

export default RequestEditForm;