// API configuration file for the application
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const buildApiEndpoint = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

export const API_ENDPOINTS = {
  AUTH: {
    SERVICE_M8: buildApiEndpoint('api/auth/servicem8'),
    CLIENT_LOGIN: (email) => buildApiEndpoint(`fetch/clientLogin/${email}`)
  },
  
  JOBS: {
    BASE: buildApiEndpoint('api/jobs'),
    FETCH_ALL: buildApiEndpoint('fetch/jobs'),
    FETCH_BY_CLIENT: (clientUuid) => buildApiEndpoint(`fetch/jobs/client/${clientUuid}`),
    FETCH_BY_ID: buildApiEndpoint('fetch/job'),
    CREATE: buildApiEndpoint('fetch/jobs/create'),
    FETCH_BY_ROLE: (userRole) => buildApiEndpoint(`fetch/jobs/role/${userRole}`),
    FETCH_CATEGORIES_BY_ROLE: (userRole) => buildApiEndpoint(`fetch/jobs/categories/role/${userRole}`)
  },
  
  CATEGORIES: {
    FETCH_ALL: buildApiEndpoint('api/categories'),
    CREATE: buildApiEndpoint('api/categories'),
    UPDATE: (id) => buildApiEndpoint(`api/categories/${id}`),
    DELETE: (id) => buildApiEndpoint(`api/categories/${id}`),
    FETCH_BY_ROLE: (userRole) => buildApiEndpoint(`api/categories/role/${userRole}`)
  },

  CLIENTS: {
    FETCH_ALL: buildApiEndpoint('fetch/clients'),
    CREATE: buildApiEndpoint('fetch/clients')
  },

  QUOTES: {
    GET_ALL: buildApiEndpoint('api/quotes'),
    GET_BY_ID: (id) => buildApiEndpoint(`api/quotes/${id}`),
    CREATE: buildApiEndpoint('api/quotes'),
    ACCEPT: (id) => buildApiEndpoint(`api/quotes/${id}/accept`),
    REJECT: (id) => buildApiEndpoint(`api/quotes/${id}/reject`)
  },

  CHAT: {
    GET_MESSAGES: (jobId) => buildApiEndpoint(`api/chat/messages/${jobId}`),
    SEND_MESSAGE: buildApiEndpoint('api/chat/messages'),
    MARK_READ: buildApiEndpoint('api/chat/messages/read'),
    GET_UNREAD: (jobId, userType) => buildApiEndpoint(`api/chat/unread/${jobId}/${userType}`),
    GET_UNREAD_JOBS: (userType) => buildApiEndpoint(`api/chat/unread-jobs/${userType}`)
  },

  ATTACHMENTS: {
    UPLOAD: (jobId) => buildApiEndpoint(`api/attachments/upload/${jobId}`),
    GET_BY_JOB: (jobId) => buildApiEndpoint(`api/attachments/job/${jobId}`),
    DOWNLOAD: (attachmentId) => buildApiEndpoint(`api/attachments/download/${attachmentId}`),
    DELETE: (attachmentId) => buildApiEndpoint(`api/attachments/${attachmentId}`)
  },

  NOTIFICATIONS: {
    GET_SETTINGS: buildApiEndpoint('api/notifications/settings'),
    UPDATE_SETTINGS: buildApiEndpoint('api/notifications/settings')
  }
};

export default API_ENDPOINTS;