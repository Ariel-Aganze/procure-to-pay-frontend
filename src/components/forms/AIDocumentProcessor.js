import React, { useState, useEffect } from 'react';
import { DocumentProcessingService } from '../../services/DocumentProcessingService';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const AIDocumentProcessor = ({ requestId, documentType, onProcessingComplete }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState(null);

  useEffect(() => {
    checkCometStatus();
  }, []);

  const checkCometStatus = async () => {
    try {
      const status = await DocumentProcessingService.getCometStatus();
      setOllamaStatus(status);
    } catch (err) {
      setOllamaStatus({
        available: false,
        status: 'error',
        error: 'Failed to check Comet AI service status',
        provider: 'Comet AI'
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
    
    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const processDocument = async () => {
    if (!file) {
      setError('Please select a file to process');
      return;
    }

    setProcessing(true);
    setError('');
    setProcessingStatus('uploading');

    try {
      // Use the DocumentProcessingService
      const result = await DocumentProcessingService.processDocument(file, documentType, requestId);
      
      if (result.success) {
        setResult(result.data);
        setProcessingStatus('completed');
        
        if (onProcessingComplete) {
          onProcessingComplete(result.data);
        }
      } else {
        setError(result.error);
        setProcessingStatus('failed');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('Processing failed. Please try again.');
      setProcessingStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const getProcessingSteps = () => {
    return [
      { id: 'uploading', label: 'Uploading Document', icon: CloudArrowUpIcon },
      { id: 'analyzing', label: 'AI Analysis in Progress', icon: CpuChipIcon },
      { id: 'extracting', label: 'Extracting Data', icon: DocumentTextIcon },
      { id: 'validating', label: 'Validating Results', icon: CheckCircleIcon },
      { id: 'completed', label: 'Processing Complete', icon: SparklesIcon },
    ];
  };

  const getCurrentStep = () => {
    if (processingStatus === 'uploading') return 0;
    if (processingStatus === 'processing') return 1;
    if (processingStatus === 'extracting') return 2;
    if (processingStatus === 'validating') return 3;
    if (processingStatus === 'completed') return 4;
    return -1;
  };

  const renderProcessingSteps = () => {
    const steps = getProcessingSteps();
    const currentStep = getCurrentStep();

    return (
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100' : 
                isActive ? 'bg-primary-100' : 
                'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : isActive ? (
                  <ArrowPathIcon className="w-5 h-5 text-primary-600 animate-spin" />
                ) : (
                  <Icon className={`w-5 h-5 ${isUpcoming ? 'text-gray-400' : 'text-primary-600'}`} />
                )}
              </div>
              <span className={`text-sm ${
                isActive ? 'text-primary-600 font-medium' : 
                isCompleted ? 'text-green-600' : 
                'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">Processing Results</h3>
        </div>

        {documentType === 'proforma' && result.vendor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h4 className="font-medium text-gray-900 mb-2">Vendor Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {result.vendor.name}</p>
                <p><span className="font-medium">Email:</span> {result.vendor.email}</p>
                <p><span className="font-medium">Address:</span> {result.vendor.address}</p>
              </div>
            </div>

            <div className="card p-4">
              <h4 className="font-medium text-gray-900 mb-2">Document Totals</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Subtotal:</span> ${result.totals?.subtotal?.toFixed(2)}</p>
                <p><span className="font-medium">Tax:</span> ${result.totals?.tax?.toFixed(2)}</p>
                <p><span className="font-medium">Total:</span> ${result.totals?.total?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {documentType === 'receipt' && result.validation && (
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-3">Validation Results</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Vendor Match</span>
                <span className={`text-sm font-medium ${result.validation.vendor_match ? 'text-green-600' : 'text-red-600'}`}>
                  {result.validation.vendor_match ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount Match</span>
                <span className={`text-sm font-medium ${result.validation.amount_match ? 'text-green-600' : 'text-red-600'}`}>
                  {result.validation.amount_match ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Items Match</span>
                <span className={`text-sm font-medium ${result.validation.items_match ? 'text-green-600' : 'text-red-600'}`}>
                  {result.validation.items_match ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Match Score</span>
                  <span className="text-lg font-bold text-primary-600">
                    {result.match_score}%
                  </span>
                </div>
              </div>
            </div>

            {result.discrepancies && result.discrepancies.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-red-600 mb-2">Discrepancies Found:</h5>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.discrepancies.map((discrepancy, index) => (
                    <li key={index}>• {discrepancy}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {result.items && result.items.length > 0 && (
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-3">Extracted Items</h4>
            <div className="space-y-2">
              {result.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.unit_price}</p>
                  </div>
                  <span className="text-sm font-medium">${(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comet AI Service Status */}
      <div className="flex items-center space-x-2 text-sm">
        <CpuChipIcon className="w-4 h-4" />
        <span className="text-gray-600">Comet AI Service Status:</span>
        <span className={`font-medium ${ollamaStatus?.available ? 'text-green-600' : 'text-red-600'}`}>
          {ollamaStatus?.available ? 'Connected' : 'Disconnected'}
        </span>
        {ollamaStatus?.provider && (
          <span className="text-xs text-gray-500">({ollamaStatus.provider})</span>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 
          file ? 'border-green-500 bg-green-50' : 
          'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center space-x-3">
            <DocumentTextIcon className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for AI processing
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div>
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop your {documentType} here, or{' '}
              <label className="text-primary-600 cursor-pointer hover:text-primary-700">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG up to 10MB • AI will extract data automatically
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-sm text-error-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      {file && !processing && !result && (
        <button
          onClick={processDocument}
          className="btn-primary w-full"
          disabled={!ollamaStatus?.available}
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Process with Comet AI
        </button>
      )}

      {/* Processing Status */}
      {processing && (
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ArrowPathIcon className="w-6 h-6 text-primary-600 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900">Comet AI Processing in Progress...</h3>
          </div>
          {renderProcessingSteps()}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="card p-6">
          {renderResult()}
        </div>
      )}

      {/* Process Another Button */}
      {result && (
        <button
          onClick={() => {
            setFile(null);
            setResult(null);
            setProcessingStatus(null);
            setError('');
          }}
          className="btn-outline w-full"
        >
          Process Another Document
        </button>
      )}
    </div>
  );
};

export default AIDocumentProcessor;