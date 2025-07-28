/**
 * Attachment System Configuration
 * 
 * This file controls which attachment system to use:
 * - 'upstash': Original Upstash Redis storage (legacy)
 * - 'servicem8': New ServiceM8 native attachment API
 * 
 * Toggle between systems by changing USE_SERVICEM8_ATTACHMENTS
 */

// Set to true to use ServiceM8 native attachments, false to use Upstash
export const USE_SERVICEM8_ATTACHMENTS = true;

// API endpoint configurations
export const ATTACHMENT_CONFIG = {
  upstash: {
    baseUrl: '/api/attachments',
    upload: (jobId) => `/api/attachments/upload/${jobId}`,
    download: (attachmentId) => `/api/attachments/download/${attachmentId}`,
    list: (jobId) => `/api/attachments/job/${jobId}`,
    delete: (attachmentId) => `/api/attachments/${attachmentId}`,
    count: (jobId) => `/api/attachments/count/${jobId}`,
    counts: () => `/api/attachments/counts`,
    all: () => `/api/attachments/all`
  },
  servicem8: {
    baseUrl: '/api/servicem8-attachments',
    upload: (jobId) => `/api/servicem8-attachments/upload/${jobId}`,
    download: (attachmentId) => `/api/servicem8-attachments/download/${attachmentId}`,
    list: (jobId) => `/api/servicem8-attachments/job/${jobId}`,
    delete: (attachmentId) => `/api/servicem8-attachments/${attachmentId}`,
    count: (jobId) => `/api/servicem8-attachments/count/${jobId}`,
    counts: () => `/api/servicem8-attachments/counts`,
    all: () => `/api/servicem8-attachments/all`
  }
};

// Get current attachment endpoints based on configuration
export const getAttachmentEndpoints = () => {
  return USE_SERVICEM8_ATTACHMENTS ? ATTACHMENT_CONFIG.servicem8 : ATTACHMENT_CONFIG.upstash;
};

// Helper function to get the attachment system name
export const getAttachmentSystemName = () => {
  return USE_SERVICEM8_ATTACHMENTS ? 'ServiceM8' : 'Upstash';
};

// Migration status tracking
export const MIGRATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Feature flags for gradual rollout
export const FEATURES = {
  // Enable ServiceM8 attachment previews
  SERVICEM8_PREVIEWS: true,
  
  // Enable attachment system switching in UI
  SYSTEM_SWITCHER: false,  // Set to true for testing
  
  // Enable migration tools
  MIGRATION_TOOLS: false,
  
  // Enable attachment analytics
  ATTACHMENT_ANALYTICS: true
};

export default {
  USE_SERVICEM8_ATTACHMENTS,
  ATTACHMENT_CONFIG,
  getAttachmentEndpoints,
  getAttachmentSystemName,
  MIGRATION_STATUS,
  FEATURES
};
