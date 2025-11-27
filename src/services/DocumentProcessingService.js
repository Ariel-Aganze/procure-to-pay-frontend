import { documentsAPI } from './api';

export class DocumentProcessingService {
  static async processProforma(file, requestId) {
    try {
      console.log('🚀 Starting ENHANCED proforma processing:', { 
        fileName: file.name, 
        fileSize: file.size,
        requestId 
      });
      
      // Step 1: Upload the file
      const uploadResponse = await documentsAPI.uploadProforma(requestId, file);
      console.log('✅ Upload successful:', uploadResponse.data);

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'File upload failed');
      }

      // Step 2: Start processing with enhanced data
      const processingResponse = await documentsAPI.triggerCometProcessing(requestId, {
        document_type: 'proforma',
        processing_type: 'extract_data',
        file_path: uploadResponse.data.file_path  // Use the returned file path
      });

      console.log('🔄 Processing started:', processingResponse.data);
      
      if (!processingResponse.data.success) {
        throw new Error(processingResponse.data.error || 'Processing start failed');
      }

      // Step 3: Enhanced polling with better error handling
      const result = await this.enhancedPolling(requestId, processingResponse.data.job_id);
      
      return {
        success: true,
        data: result,
        message: 'Document processed successfully with enhanced AI extraction',
        file_info: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      };

    } catch (error) {
      console.error('❌ Enhanced proforma processing error:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to process proforma',
        data: null,
        suggestion: 'Please try uploading the document again or check if the file is readable.'
      };
    }
  }

  static async processReceipt(file, requestId) {
    try {
      console.log('🧾 Starting enhanced receipt processing:', { 
        fileName: file.name, 
        requestId 
      });
      
      // Upload the receipt using existing endpoint
      const uploadResponse = await documentsAPI.uploadReceipt
        ? await documentsAPI.uploadReceipt(requestId, file)
        : await fetch(`/api/documents/upload-receipt/${requestId}/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: (() => {
              const formData = new FormData();
              formData.append('receipt', file);
              return formData;
            })()
          }).then(res => res.json()).then(data => ({ data }));

      console.log('✅ Receipt upload successful:', uploadResponse.data);

      // Start processing
      const processingResponse = await documentsAPI.triggerCometProcessing(requestId, {
        document_type: 'receipt',
        processing_type: 'validate_receipt',
        file_path: uploadResponse.data.file_path
      });

      console.log('🔄 Receipt processing started:', processingResponse.data);
      
      // Enhanced polling
      const result = await this.enhancedPolling(requestId, processingResponse.data.job_id);
      
      return {
        success: true,
        data: result,
        message: 'Receipt processed and validated successfully'
      };

    } catch (error) {
      console.error('❌ Receipt processing error:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to process receipt',
        data: null
      };
    }
  }

  static async enhancedPolling(requestId, jobId, maxAttempts = 40, interval = 3000) {
    console.log(`🔍 Starting enhanced polling for job: ${jobId}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📊 Polling attempt ${attempt}/${maxAttempts} for job ${jobId}`);
        
        const statusResponse = await documentsAPI.getCometProcessingStatus(requestId, jobId);
        const status = statusResponse.data;
        
        console.log(`📈 Status update:`, {
          attempt,
          status: status.status,
          jobId: status.job_id,
          hasResult: !!status.result,
          hasError: !!status.error
        });

        if (status.status === 'completed') {
          console.log('✅ Processing completed successfully!');
          console.log('📋 Extracted data preview:', {
            vendor: status.result?.vendor_name,
            amount: status.result?.total_amount,
            confidence: status.result?._ai_confidence
          });
          return status.result;
        } 
        
        else if (status.status === 'failed') {
          const errorMsg = status.error || 'Processing failed for unknown reason';
          console.error('❌ Processing failed:', {
            error: errorMsg,
            errorData: status.error_data,
            suggestion: status.retry_suggestion
          });
          throw new Error(errorMsg);
        } 
        
        else if (status.status === 'not_found') {
          const errorMsg = 'Processing job not found. It may have expired.';
          console.error('🔍 Job not found:', {
            jobId,
            attempt,
            debugInfo: status.debug_info
          });
          throw new Error(errorMsg);
        }
        
        else if (status.status === 'access_denied') {
          throw new Error('Access denied to this processing job.');
        }

        // Still processing, wait and try again
        if (attempt < maxAttempts) {
          console.log(`⏳ Still processing... waiting ${interval/1000}s before next check`);
          await this.sleep(interval);
          
          // Increase interval gradually to be less aggressive
          if (attempt > 10) {
            interval = Math.min(interval * 1.1, 8000); // Max 8 seconds
          }
        }
        
      } catch (error) {
        console.error(`💥 Error during polling attempt ${attempt}:`, error);
        
        // If it's a final error (not network), don't retry
        if (error.message.includes('not found') || 
            error.message.includes('access denied') ||
            error.message.includes('Processing failed')) {
          throw error;
        }
        
        // For network errors, retry a few times
        if (attempt >= 5) {
          throw new Error(`Polling failed after ${attempt} attempts: ${error.message}`);
        }
        
        console.log(`🔄 Network error, retrying in ${interval/1000}s...`);
        await this.sleep(interval);
      }
    }
    
    throw new Error(`Processing timeout - job took longer than ${maxAttempts * interval / 1000} seconds to complete`);
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced status checking with debugging
  static async checkProcessingStatus(requestId, jobId) {
    try {
      const response = await documentsAPI.getCometProcessingStatus(requestId, jobId);
      
      console.log('📊 Status check result:', {
        jobId,
        status: response.data.status,
        hasResult: !!response.data.result,
        hasError: !!response.data.error,
        debugInfo: response.data.debug_info
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Status check failed:', error);
      
      if (error.response?.status === 404) {
        return {
          status: 'not_found',
          error: 'Job not found. It may have expired.',
          suggestion: 'Try uploading and processing the document again.'
        };
      }
      
      throw error;
    }
  }

  // Utility method for retrying failed processing
  static async retryProcessing(requestId, documentType) {
    console.log(`🔄 Retrying ${documentType} processing for request ${requestId}`);
    
    // This would need the file to be re-uploaded or stored somewhere
    // For now, just return a helpful message
    return {
      success: false,
      error: 'To retry processing, please upload the document again.',
      action_required: 'upload_again'
    };
  }

  // Enhanced error handling with specific suggestions
  static handleProcessingError(error, context = {}) {
    console.error('🔥 Processing error details:', {
      error: error.message,
      context,
      stack: error.stack
    });
    
    let suggestion = 'Please try again.';
    
    if (error.message.includes('not found')) {
      suggestion = 'The processing job expired. Please upload and process the document again.';
    } else if (error.message.includes('file not found')) {
      suggestion = 'The uploaded file could not be found. Please upload the document again.';
    } else if (error.message.includes('timeout')) {
      suggestion = 'Processing took too long. Please try with a smaller or clearer document.';
    } else if (error.message.includes('invalid file type')) {
      suggestion = 'Please upload a PDF, JPG, or PNG file.';
    }
    
    return {
      success: false,
      error: error.message,
      suggestion,
      context
    };
  }

  // Legacy methods for compatibility
  static async extractProformaData(file) {
    console.log('📄 Legacy extractProformaData called, routing to enhanced processing...');
    return await this.processProforma(file, 'legacy');
  }

  static async validateReceiptLocal(file) {
    console.log('🧾 Legacy validateReceiptLocal called, routing to enhanced processing...');
    return await this.processReceipt(file, 'legacy');
  }
}

// Export for compatibility
export default DocumentProcessingService;