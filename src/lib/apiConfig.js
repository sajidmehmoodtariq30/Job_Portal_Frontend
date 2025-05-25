// API configuration file for the application
// This centralizes all API URL management

// Get the API URL from environment variables or fallback to a default
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to build API endpoints
export const buildApiEndpoint = (path) => {
  // Remove leading slash if it exists to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SERVICE_M8: buildApiEndpoint('api/auth/servicem8'),
    CLIENT_LOGIN: (email) => buildApiEndpoint(`fetch/clientLogin/${email}`),
  },  // Jobs endpoints
  JOBS: {
    FETCH_ALL: buildApiEndpoint('fetch/jobs'),
    FETCH_BY_CLIENT: (clientUuid) => buildApiEndpoint(`fetch/jobs/client/${clientUuid}`),
    FETCH_BY_ID: buildApiEndpoint('fetch/job'),
    CREATE: buildApiEndpoint('fetch/jobs/create'),
  },// Clients endpoints
  CLIENTS: {
    FETCH_ALL: buildApiEndpoint('fetch/clients'),
    CREATE: buildApiEndpoint('fetch/clients'),
  },

  // Quotes endpoints
  QUOTES: {
    GET_ALL: buildApiEndpoint('api/quotes'),
    GET_BY_ID: (id) => buildApiEndpoint(`api/quotes/${id}`),
    CREATE: buildApiEndpoint('api/quotes'),
    ACCEPT: (id) => buildApiEndpoint(`api/quotes/${id}/accept`),
    REJECT: (id) => buildApiEndpoint(`api/quotes/${id}/reject`),
  },

  // Chat endpoints
  CHAT: {
    GET_MESSAGES: (jobId) => buildApiEndpoint(`api/chat/messages/${jobId}`),
    SEND_MESSAGE: buildApiEndpoint('api/chat/messages'),
    MARK_READ: buildApiEndpoint('api/chat/messages/read'),
    GET_UNREAD: (jobId, userType) => buildApiEndpoint(`api/chat/unread/${jobId}/${userType}`),
    GET_UNREAD_JOBS: (userType) => buildApiEndpoint(`api/chat/unread-jobs/${userType}`),
  },
  // Attachment endpoints
  ATTACHMENTS: {
    UPLOAD: (jobId) => buildApiEndpoint(`api/attachments/upload/${jobId}`),
    GET_BY_JOB: (jobId) => buildApiEndpoint(`api/attachments/job/${jobId}`),
    DOWNLOAD: (attachmentId) => buildApiEndpoint(`api/attachments/download/${attachmentId}`),
    DELETE: (attachmentId) => buildApiEndpoint(`api/attachments/${attachmentId}`),
  },
};

export default API_ENDPOINTS;