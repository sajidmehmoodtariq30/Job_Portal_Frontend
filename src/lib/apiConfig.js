// API configuration file for the application
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const buildApiEndpoint = (path) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

export const API_ENDPOINTS = {  AUTH: {
    SERVICE_M8: buildApiEndpoint('api/auth/servicem8'),
    CLIENT_LOGIN: (email) => buildApiEndpoint(`fetch/clientLogin/${email}`),
    CLIENT_AUTH: buildApiEndpoint('fetch/client-login'),
    USER_LOGIN: buildApiEndpoint('api/users/login'),
    FORGOT_PASSWORD: buildApiEndpoint('api/users/forgot-password'),
    RESET_PASSWORD: buildApiEndpoint('api/users/reset-password'),
    PASSWORD_SETUP: buildApiEndpoint('api/password-setup'),
    USER_PASSWORD_SETUP: buildApiEndpoint('api/users/password-setup'),
    VALIDATE_SETUP_TOKEN: (token) => buildApiEndpoint(`fetch/validate-setup-token/${token}`),
    VALIDATE_USER_SETUP_TOKEN: (token) => buildApiEndpoint(`api/users/validate-setup-token/${token}`)
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
  },  CLIENTS: {
    FETCH_ALL: buildApiEndpoint('fetch/clients'),
    CREATE: buildApiEndpoint('fetch/clients'),
    UPDATE_STATUS: (uuid) => buildApiEndpoint(`fetch/clients/${uuid}/status`),
    BULK_UPDATE_STATUS: buildApiEndpoint('fetch/clients/bulk-status'),
    GET_PERMISSIONS: (clientId) => buildApiEndpoint(`fetch/clients/${clientId}/permissions`),
    UPDATE_PERMISSIONS: (clientId) => buildApiEndpoint(`fetch/clients/${clientId}/permissions`),
    ASSIGN_USERNAME: (uuid) => buildApiEndpoint(`fetch/clients/${uuid}/assign-username`),
    
    // Client Name Mappings
    MAPPINGS: {
      GET_ALL: buildApiEndpoint('fetch/clients/mappings'),
      CREATE: buildApiEndpoint('fetch/clients/mappings'),
      UPDATE: (id) => buildApiEndpoint(`fetch/clients/mappings/${id}`),
      DELETE: (id) => buildApiEndpoint(`fetch/clients/mappings/${id}`),
      GET_BY_EMAIL: (email) => buildApiEndpoint(`fetch/clients/mappings/by-email/${email}`)    }
  },
    USERS: {
    FETCH_ALL: buildApiEndpoint('api/users'),
    CREATE: buildApiEndpoint('api/users'),
    UPDATE: (id) => buildApiEndpoint(`api/users/${id}`),
    DELETE: (id) => buildApiEndpoint(`api/users/${id}`),
    UPDATE_STATUS: (id) => buildApiEndpoint(`api/users/${id}/status`),
    GET_PASSWORD: (id) => buildApiEndpoint(`api/users/${id}/password`),
    UPDATE_PASSWORD: (id) => buildApiEndpoint(`api/users/${id}/password`),
    RESEND_SETUP: (id) => buildApiEndpoint(`api/users/${id}/resend-setup`)
  },
    SITES: {
    // READ-ONLY ENDPOINTS (ServiceM8 site data)
    GET_ALL: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites`),
    GET_ALL_GLOBAL: buildApiEndpoint('api/sites/all'),  // Admin view - all sites
    GET_DEFAULT: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites/default`),
    
    // DISABLED ENDPOINTS (ServiceM8 site data is read-only)
    // CREATE: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites`),
    // UPDATE: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}`),
    // DELETE: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}`),
    // SET_DEFAULT: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}/set-default`)
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