/**
 * Attachment Service - Unified API for both Upstash and ServiceM8 attachments
 * 
 * This service provides a consistent interface for attachment operations
 * regardless of the underlying storage system (Upstash or ServiceM8).
 */

import { getAttachmentEndpoints, getAttachmentSystemName } from '../config/attachmentConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function to get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const clientId = localStorage.getItem('clientId') || localStorage.getItem('client_id');
  
  return {
    'Authorization': `Bearer ${token}`,
    'x-client-uuid': clientId || '',
    'x-attachment-system': getAttachmentSystemName()
  };
};

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Upload a file attachment for a specific job
 * @param {string} jobId - Job UUID
 * @param {File} file - File to upload
 * @param {string} userType - Type of user (client, admin)
 * @param {string} userName - Name of the user uploading
 * @returns {Promise<Object>} Upload result
 */
export const uploadAttachment = async (jobId, file, userType = 'client', userName = 'Unknown User') => {
  try {
    const endpoints = getAttachmentEndpoints();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('userType', userType);
    formData.append('userName', userName);
    
    console.log(`📤 Uploading file via ${getAttachmentSystemName()}:`, {
      fileName: file.name,
      fileSize: file.size,
      jobId,
      userType,
      endpoint: endpoints.upload(jobId)
    });
    
    const response = await fetch(`${API_URL}${endpoints.upload(jobId)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    
    const result = await handleResponse(response);
    
    console.log(`✅ File uploaded successfully via ${getAttachmentSystemName()}:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Upload failed via ${getAttachmentSystemName()}:`, error);
    throw error;
  }
};

/**
 * Get all attachments for a specific job
 * @param {string} jobId - Job UUID
 * @returns {Promise<Array>} List of attachments
 */
export const getJobAttachments = async (jobId) => {
  try {
    const endpoints = getAttachmentEndpoints();
    
    console.log(`📥 Fetching attachments via ${getAttachmentSystemName()} for job:`, jobId);
    
    const response = await fetch(`${API_URL}${endpoints.list(jobId)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleResponse(response);
    
    console.log(`✅ Retrieved ${result.data?.length || 0} attachments via ${getAttachmentSystemName()}`);
    return result.data || [];
    
  } catch (error) {
    console.error(`❌ Failed to fetch attachments via ${getAttachmentSystemName()}:`, error);
    throw error;
  }
};

/**
 * Download a specific attachment
 * @param {string} attachmentId - Attachment UUID
 * @param {string} fileName - Original file name for download
 * @returns {Promise<Blob>} File blob
 */
export const downloadAttachment = async (attachmentId, fileName = 'download') => {
  try {
    const endpoints = getAttachmentEndpoints();
    
    console.log(`📥 Downloading attachment via ${getAttachmentSystemName()}:`, attachmentId);
    
    const response = await fetch(`${API_URL}${endpoints.download(attachmentId)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    console.log(`✅ Downloaded attachment via ${getAttachmentSystemName()}:`, fileName);
    return blob;
    
  } catch (error) {
    console.error(`❌ Download failed via ${getAttachmentSystemName()}:`, error);
    throw error;
  }
};

/**
 * Trigger file download in browser
 * @param {string} attachmentId - Attachment UUID
 * @param {string} fileName - Original file name
 */
export const triggerDownload = async (attachmentId, fileName = 'download') => {
  try {
    const blob = await downloadAttachment(attachmentId, fileName);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ File download triggered:`, fileName);
    
  } catch (error) {
    console.error(`❌ Download trigger failed:`, error);
    throw error;
  }
};

/**
 * Delete a specific attachment
 * @param {string} attachmentId - Attachment UUID
 * @returns {Promise<Object>} Delete result
 */
export const deleteAttachment = async (attachmentId) => {
  try {
    const endpoints = getAttachmentEndpoints();
    
    console.log(`🗑️ Deleting attachment via ${getAttachmentSystemName()}:`, attachmentId);
    
    const response = await fetch(`${API_URL}${endpoints.delete(attachmentId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const result = await handleResponse(response);
    
    console.log(`✅ Attachment deleted via ${getAttachmentSystemName()}:`, attachmentId);
    return result;
    
  } catch (error) {
    console.error(`❌ Delete failed via ${getAttachmentSystemName()}:`, error);
    throw error;
  }
};

/**
 * Get attachment count for a specific job
 * @param {string} jobId - Job UUID
 * @returns {Promise<number>} Attachment count
 */
export const getAttachmentCount = async (jobId) => {
  try {
    const endpoints = getAttachmentEndpoints();
    
    const response = await fetch(`${API_URL}${endpoints.count(jobId)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleResponse(response);
    
    return result.count || 0;
    
  } catch (error) {
    console.error(`❌ Failed to get attachment count via ${getAttachmentSystemName()}:`, error);
    return 0; // Return 0 on error for graceful degradation
  }
};

/**
 * Get attachment counts for multiple jobs (bulk operation)
 * @param {Array<string>} jobIds - Array of job UUIDs
 * @returns {Promise<Object>} Object with jobId -> count mapping
 */
export const getBulkAttachmentCounts = async (jobIds) => {
  try {
    const endpoints = getAttachmentEndpoints();
    
    const response = await fetch(`${API_URL}${endpoints.counts()}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobIds })
    });
    
    const result = await handleResponse(response);
    
    return result.counts || {};
    
  } catch (error) {
    console.error(`❌ Failed to get bulk attachment counts via ${getAttachmentSystemName()}:`, error);
    return {}; // Return empty object on error
  }
};

/**
 * Get all attachments across jobs (admin view)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} jobId - Optional job filter
 * @returns {Promise<Object>} Paginated attachment list
 */
export const getAllAttachments = async (page = 1, limit = 50, jobId = null) => {
  try {
    const endpoints = getAttachmentEndpoints();
    const params = new URLSearchParams({ page, limit });
    if (jobId) params.append('jobId', jobId);
    
    const response = await fetch(`${API_URL}${endpoints.all()}?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const result = await handleResponse(response);
    
    console.log(`✅ Retrieved ${result.data?.length || 0} attachments via ${getAttachmentSystemName()} (page ${page})`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to get all attachments via ${getAttachmentSystemName()}:`, error);
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon based on MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} Icon name/class
 */
export const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'file';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'file-pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-spreadsheet';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'file-archive';
  
  return 'file';
};

/**
 * Check if file type is supported for preview
 * @param {string} mimeType - File MIME type
 * @returns {boolean} Whether preview is supported
 */
export const isPreviewSupported = (mimeType) => {
  const previewTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain'
  ];
  
  return previewTypes.includes(mimeType);
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options.allowedTypes || [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed'
  ];
  
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type (${file.type}) is not supported`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  uploadAttachment,
  getJobAttachments,
  downloadAttachment,
  triggerDownload,
  deleteAttachment,
  getAttachmentCount,
  getBulkAttachmentCounts,
  getAllAttachments,
  formatFileSize,
  getFileTypeIcon,
  isPreviewSupported,
  validateFile
};
