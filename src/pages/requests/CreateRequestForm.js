import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import AIDocumentProcessor from '../../components/forms/AIDocumentProcessor';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PaperClipIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const CreateRequestForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    priority: 'medium',
    vendorName: '',
    vendorEmail: '',
    expectedDeliveryDate: '',
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: '',
        brand: '',
        model: '',
        specifications: '',
      }
    ],
  });

  const [dragActive, setDragActive] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-blue-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              [field]: value,
              // Auto-calculate total price
              totalPrice: field === 'quantity' || field === 'unitPrice' 
                ? (parseFloat(field === 'quantity' ? value : item.quantity) || 0) * 
                  (parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0)
                : item.totalPrice
            }
          : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: '',
        brand: '',
        model: '',
        specifications: '',
        totalPrice: 0,
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((total, item) => {
      const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      return total + itemTotal;
    }, 0);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Request title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.vendorName.trim()) {
      setError('Vendor name is required');
      return false;
    }
    
    // Validate at least one item with description
    const hasValidItem = formData.items.some(item => 
      item.description.trim() && 
      parseFloat(item.quantity) > 0 && 
      parseFloat(item.unitPrice) > 0
    );
    
    if (!hasValidItem) {
      setError('At least one item with description, quantity, and price is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare request data WITHOUT items first
      const totalAmount = calculateTotalAmount();
      
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: totalAmount.toString(),
        priority: formData.priority,
        vendor_name: formData.vendorName.trim(),
        vendor_email: formData.vendorEmail.trim() || '',
        expected_delivery_date: formData.expectedDeliveryDate || null,
      };

      console.log('Sending request data (without items):', JSON.stringify(requestData, null, 2));

      // Create the request first
      const response = await requestsAPI.createRequest(requestData);
      const createdRequest = response.data;
      console.log('Request created successfully:', createdRequest);

      // Note: AI document processing is now handled separately in the AIDocumentProcessor component

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/requests/my');
      }, 2000);

    } catch (error) {
      console.error('Create request error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create request. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
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
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Created Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your purchase request has been submitted and is now pending approval.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Purchase Request</h1>
        <p className="mt-2 text-gray-600">
          Fill out the form below to submit a new purchase request for approval.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-error-400" />
            <div className="ml-3">
              <p className="text-sm text-error-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Office Supplies for Q4 2024"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input"
                placeholder="Provide detailed description of what you need and why..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
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
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleInputChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Vendor Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Office Depot"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Email
              </label>
              <input
                type="email"
                name="vendorEmail"
                value={formData.vendorEmail}
                onChange={handleInputChange}
                className="input"
                placeholder="sales@vendor.com"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-outline"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-6">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Item {index + 1}</h3>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="input"
                      placeholder="e.g., Office Chair - Ergonomic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                      className="input"
                      placeholder="e.g., Herman Miller"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={item.model}
                      onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                      className="input"
                      placeholder="e.g., Aeron Chair"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Price
                    </label>
                    <div className="input bg-gray-50 text-gray-700">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specifications
                    </label>
                    <textarea
                      value={item.specifications}
                      onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                      className="input"
                      rows={2}
                      placeholder="Additional specifications or requirements..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${calculateTotalAmount().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Document Processing */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PaperClipIcon className="w-5 h-5 mr-2" />
            Proforma / Quotation Processing
          </h2>
          <p className="text-gray-600 mb-4">
            Upload your proforma or quotation document and our Comet AI will automatically extract vendor information, 
            items, and pricing to populate your request. Supports PDF, JPG, and PNG formats.
          </p>
          
          <AIDocumentProcessor
            requestId={null} // Will be set after request creation
            documentType="proforma"
            onProcessingComplete={(extractedData) => {
              console.log('AI extracted data:', extractedData);
              
              // Auto-populate form fields with extracted data
              if (extractedData.vendor) {
                setFormData(prev => ({
                  ...prev,
                  vendorName: extractedData.vendor.name || prev.vendorName,
                  vendorEmail: extractedData.vendor.email || prev.vendorEmail,
                }));
              }
              
              // Auto-populate items if extracted
              if (extractedData.items && extractedData.items.length > 0) {
                const extractedItems = extractedData.items.map(item => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unit_price.toString(),
                  brand: '',
                  model: '',
                  specifications: '',
                  totalPrice: item.quantity * item.unit_price,
                }));
                
                setFormData(prev => ({
                  ...prev,
                  items: extractedItems,
                }));
              }
            }}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Request...
              </div>
            ) : (
              'Create Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestForm;