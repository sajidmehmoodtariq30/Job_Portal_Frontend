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
    ASSIGN_USERNAME: (uuid) => buildApiEndpoint(`fetch/clients/${uuid}/assign-username`),
    
    // Client Name Mappings
    MAPPINGS: {
      GET_ALL: buildApiEndpoint('fetch/clients/mappings'),
      CREATE: buildApiEndpoint('fetch/clients/mappings'),
      UPDATE: (id) => buildApiEndpoint(`fetch/clients/mappings/${id}`),
      DELETE: (id) => buildApiEndpoint(`fetch/clients/mappings/${id}`),
      GET_BY_EMAIL: (email) => buildApiEndpoint(`fetch/clients/mappings/by-email/${email}`)    }
  },    USERS: {
    FETCH_ALL: buildApiEndpoint('api/users'),
    CREATE: buildApiEndpoint('api/users'),
    UPDATE: (id) => buildApiEndpoint(`api/users/${id}`),
    DELETE: (id) => buildApiEndpoint(`api/users/${id}`),
    UPDATE_STATUS: (id) => buildApiEndpoint(`api/users/${id}/status`),
    GET_PASSWORD: (id) => buildApiEndpoint(`api/users/${id}/password`),
    UPDATE_PASSWORD: (id) => buildApiEndpoint(`api/users/${id}/password`),
    RESEND_SETUP: (id) => buildApiEndpoint(`api/users/${id}/resend-setup`),
    GET_CLIENT_NAME: (uuid) => buildApiEndpoint(`api/users/client-name/${uuid}`), // Add client name endpoint
    GET_CLIENT_SITES: (id) => buildApiEndpoint(`api/users/${id}/client-sites`) // Add client sites endpoint
  },  SITES: {
    // READ-ONLY ENDPOINTS (ServiceM8 site data)
    GET_ALL: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites`),
    GET_ALL_GLOBAL: buildApiEndpoint('api/sites/all'),  // Admin view - all sites
    GET_ALL_FROM_JOBS: buildApiEndpoint('api/sites/all/from-jobs'), // Admin view - all sites from all jobs
    GET_FROM_JOBS: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites/from-jobs`), // Extract sites from jobs
    GET_DEFAULT: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites/default`),
    SET_DEFAULT: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}/set-default`), // Keep for dropdown functionality
    
    // DISABLED ENDPOINTS (ServiceM8 site data is read-only)
    // CREATE: (clientId) => buildApiEndpoint(`api/clients/${clientId}/sites`),
    // UPDATE: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}`),
    // DELETE: (clientId, siteId) => buildApiEndpoint(`api/clients/${clientId}/sites/${siteId}`)
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
  },
  USERS: {
    FETCH_ALL: buildApiEndpoint('api/users'),
    CREATE: buildApiEndpoint('api/users'),
    UPDATE: (userId) => buildApiEndpoint(`api/users/${userId}`),
    DELETE: (userId) => buildApiEndpoint(`api/users/${userId}`),
    UPDATE_STATUS: (userId) => buildApiEndpoint(`api/users/${userId}/status`),
    UPDATE_PERMISSIONS: (userId) => buildApiEndpoint(`api/users/${userId}/permissions`),
    GET_PERMISSIONS: (userId) => buildApiEndpoint(`api/users/${userId}/permissions`),
    GET_PASSWORD: (userId) => buildApiEndpoint(`api/users/${userId}/password`),
    UPDATE_PASSWORD: (userId) => buildApiEndpoint(`api/users/${userId}/password`),
    RESEND_SETUP: (userId) => buildApiEndpoint(`api/users/${userId}/resend-setup`),
    GET_CLIENT_SITES: (userId) => buildApiEndpoint(`api/users/${userId}/client-sites`),
    RESET_PASSWORD: (userId) => buildApiEndpoint(`api/users/${userId}/reset-password`)
  },  NOTES: {
    GET_BY_JOB: (jobId) => buildApiEndpoint(`api/notes/${jobId}`),
    CREATE: buildApiEndpoint('api/notes'),
    UPDATE: (noteId) => buildApiEndpoint(`api/notes/${noteId}`),
    DELETE: (noteId) => buildApiEndpoint(`api/notes/${noteId}`),
    GET_SINGLE: (noteId) => buildApiEndpoint(`api/notes/single/${noteId}`)
  },  CLIENT_VALIDATION: {
    VALIDATE_ASSIGNMENT: buildApiEndpoint('api/client/validate-client-assignment')
  },
  CONTACTS: {
    GET_ALL: buildApiEndpoint('api/contacts'),
    GET_CLIENT_SITES: (clientUuid) => buildApiEndpoint(`api/clients/${clientUuid}/sites`)
  }
};

export default API_ENDPOINTS;