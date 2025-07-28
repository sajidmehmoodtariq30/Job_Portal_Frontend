/**
 * Attachment System Configuration
 * 
 * This file controls which attachment system to use:
 * - 'upstash': Original Upstash Redis storage (legacy)
 * - 'servicem8': New ServiceM8 native attachment API
 * 
 * Toggle between systems by changing USE_SERVICEM8_ATTACHMENTS
 */

// ServiceM8-only attachment system configuration
export const USE_SERVICEM8_ATTACHMENTS = true;  // Always true now

// ServiceM8 API endpoint configuration
export const ATTACHMENT_CONFIG = {
  baseUrl: '/api/servicem8-attachments',
  upload: (jobId) => `/api/servicem8-attachments/upload/${jobId}`,
  download: (attachmentId) => `/api/servicem8-attachments/download/${attachmentId}`,
  list: (jobId) => `/api/servicem8-attachments/job/${jobId}`,
  delete: (attachmentId) => `/api/servicem8-attachments/${attachmentId}`,
  count: (jobId) => `/api/servicem8-attachments/count/${jobId}`,
  counts: () => `/api/servicem8-attachments/counts`,
  all: () => `/api/servicem8-attachments/all`
};

// Get attachment endpoints (ServiceM8 only)
export const getAttachmentEndpoints = () => {
  return ATTACHMENT_CONFIG;
};

// Helper function to get the attachment system name
export const getAttachmentSystemName = () => {
  return 'ServiceM8';
};

// Feature flags for ServiceM8 attachments
export const FEATURES = {
  // Enable ServiceM8 attachment previews
  SERVICEM8_PREVIEWS: true,
  
  // Enable attachment analytics
  ATTACHMENT_ANALYTICS: true,
  
  // Enable automatic thumbnail generation
  AUTO_THUMBNAILS: true,
  
  // Enable file type validation
  FILE_TYPE_VALIDATION: true
};

export default {
  USE_SERVICEM8_ATTACHMENTS,
  ATTACHMENT_CONFIG,
  getAttachmentEndpoints,
  getAttachmentSystemName,
  FEATURES
};
