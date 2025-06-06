// Client Permission System based on ServiceM8 capabilities
export const CLIENT_PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard_view',
  // Job Management
  JOBS_CREATE: 'jobs_create', 
  JOBS_EDIT: 'jobs_edit',
  JOBS_STATUS_UPDATE: 'jobs_status_update',
  
  // Attachments
  ATTACHMENTS_VIEW: 'attachments_view',
  ATTACHMENTS_UPLOAD: 'attachments_upload',
  ATTACHMENTS_DOWNLOAD: 'attachments_download',
  
  // Quote Management
  QUOTES_VIEW: 'quotes_view',
  QUOTES_ACCEPT: 'quotes_accept',
  QUOTES_REJECT: 'quotes_reject',
  QUOTES_REQUEST: 'quotes_request',
  
  // Invoice Management  
  INVOICES_VIEW: 'invoices_view',
  INVOICES_PAY: 'invoices_pay',
  INVOICES_DOWNLOAD: 'invoices_download',
  
  // Schedule/Calendar
  SCHEDULE_VIEW: 'schedule_view',
  SCHEDULE_BOOK: 'schedule_book',
  
  // Communication
  CHAT_ACCESS: 'chat_access',
  NOTIFICATIONS: 'notifications',
  
  // Reports
  REPORTS_VIEW: 'reports_view',
  REPORTS_DOWNLOAD: 'reports_download',
  
  // Profile Management
  PROFILE_EDIT: 'profile_edit',
  COMPANY_DETAILS_EDIT: 'company_details_edit',
  
  // Support
  SUPPORT_ACCESS: 'support_access',
  SUPPORT_CREATE_TICKET: 'support_create_ticket'
};

// Permission Categories for better organization
export const PERMISSION_CATEGORIES = {
  'Dashboard': [
    CLIENT_PERMISSIONS.DASHBOARD_VIEW
  ],  'Job Management': [
    CLIENT_PERMISSIONS.JOBS_CREATE,
    CLIENT_PERMISSIONS.JOBS_EDIT,
    CLIENT_PERMISSIONS.JOBS_STATUS_UPDATE
  ],
  'Attachments': [
    CLIENT_PERMISSIONS.ATTACHMENTS_VIEW,
    CLIENT_PERMISSIONS.ATTACHMENTS_UPLOAD,
    CLIENT_PERMISSIONS.ATTACHMENTS_DOWNLOAD
  ],
  'Quote Management': [
    CLIENT_PERMISSIONS.QUOTES_VIEW,
    CLIENT_PERMISSIONS.QUOTES_ACCEPT,
    CLIENT_PERMISSIONS.QUOTES_REJECT,
    CLIENT_PERMISSIONS.QUOTES_REQUEST
  ],
  'Financial': [
    CLIENT_PERMISSIONS.INVOICES_VIEW,
    CLIENT_PERMISSIONS.INVOICES_PAY,
    CLIENT_PERMISSIONS.INVOICES_DOWNLOAD
  ],
  'Scheduling': [
    CLIENT_PERMISSIONS.SCHEDULE_VIEW,
    CLIENT_PERMISSIONS.SCHEDULE_BOOK
  ],
  'Communication': [
    CLIENT_PERMISSIONS.CHAT_ACCESS,
    CLIENT_PERMISSIONS.NOTIFICATIONS
  ],
  'Reports': [
    CLIENT_PERMISSIONS.REPORTS_VIEW,
    CLIENT_PERMISSIONS.REPORTS_DOWNLOAD
  ],
  'Profile': [
    CLIENT_PERMISSIONS.PROFILE_EDIT,
    CLIENT_PERMISSIONS.COMPANY_DETAILS_EDIT
  ],
  'Support': [
    CLIENT_PERMISSIONS.SUPPORT_ACCESS,
    CLIENT_PERMISSIONS.SUPPORT_CREATE_TICKET
  ]
};

// Permission Labels for UI display
export const PERMISSION_LABELS = {  [CLIENT_PERMISSIONS.DASHBOARD_VIEW]: 'View Dashboard',
  [CLIENT_PERMISSIONS.JOBS_CREATE]: 'Create New Jobs',
  [CLIENT_PERMISSIONS.JOBS_EDIT]: 'Edit Job Details',
  [CLIENT_PERMISSIONS.JOBS_STATUS_UPDATE]: 'Update Job Status',
  [CLIENT_PERMISSIONS.ATTACHMENTS_VIEW]: 'View Attachments',
  [CLIENT_PERMISSIONS.ATTACHMENTS_UPLOAD]: 'Upload Attachments',
  [CLIENT_PERMISSIONS.ATTACHMENTS_DOWNLOAD]: 'Download Attachments',
  [CLIENT_PERMISSIONS.QUOTES_VIEW]: 'View Quotes',
  [CLIENT_PERMISSIONS.QUOTES_ACCEPT]: 'Accept Quotes',
  [CLIENT_PERMISSIONS.QUOTES_REJECT]: 'Reject Quotes',
  [CLIENT_PERMISSIONS.QUOTES_REQUEST]: 'Request New Quotes',
  [CLIENT_PERMISSIONS.INVOICES_VIEW]: 'View Invoices',
  [CLIENT_PERMISSIONS.INVOICES_PAY]: 'Pay Invoices Online',
  [CLIENT_PERMISSIONS.INVOICES_DOWNLOAD]: 'Download Invoices',
  [CLIENT_PERMISSIONS.SCHEDULE_VIEW]: 'View Schedule',
  [CLIENT_PERMISSIONS.SCHEDULE_BOOK]: 'Book Appointments',
  [CLIENT_PERMISSIONS.CHAT_ACCESS]: 'Chat with Team',
  [CLIENT_PERMISSIONS.NOTIFICATIONS]: 'Receive Notifications',
  [CLIENT_PERMISSIONS.REPORTS_VIEW]: 'View Reports',
  [CLIENT_PERMISSIONS.REPORTS_DOWNLOAD]: 'Download Reports',
  [CLIENT_PERMISSIONS.PROFILE_EDIT]: 'Edit Profile',
  [CLIENT_PERMISSIONS.COMPANY_DETAILS_EDIT]: 'Edit Company Details',
  [CLIENT_PERMISSIONS.SUPPORT_ACCESS]: 'Access Support',
  [CLIENT_PERMISSIONS.SUPPORT_CREATE_TICKET]: 'Create Support Tickets'
};

// Predefined permission templates
export const CLIENT_PERMISSION_TEMPLATES = {  'Basic Client': [
    CLIENT_PERMISSIONS.DASHBOARD_VIEW,
    CLIENT_PERMISSIONS.QUOTES_VIEW,
    CLIENT_PERMISSIONS.QUOTES_ACCEPT,
    CLIENT_PERMISSIONS.QUOTES_REJECT,
    CLIENT_PERMISSIONS.INVOICES_VIEW,
    CLIENT_PERMISSIONS.PROFILE_EDIT,
    CLIENT_PERMISSIONS.SUPPORT_ACCESS
  ],  'Premium Client': [
    CLIENT_PERMISSIONS.DASHBOARD_VIEW,
    CLIENT_PERMISSIONS.JOBS_CREATE,
    CLIENT_PERMISSIONS.ATTACHMENTS_VIEW,
    CLIENT_PERMISSIONS.ATTACHMENTS_UPLOAD,
    CLIENT_PERMISSIONS.ATTACHMENTS_DOWNLOAD,
    CLIENT_PERMISSIONS.QUOTES_VIEW,
    CLIENT_PERMISSIONS.QUOTES_ACCEPT,
    CLIENT_PERMISSIONS.QUOTES_REJECT,
    CLIENT_PERMISSIONS.QUOTES_REQUEST,
    CLIENT_PERMISSIONS.INVOICES_VIEW,
    CLIENT_PERMISSIONS.INVOICES_PAY,
    CLIENT_PERMISSIONS.INVOICES_DOWNLOAD,
    CLIENT_PERMISSIONS.SCHEDULE_VIEW,
    CLIENT_PERMISSIONS.SCHEDULE_BOOK,
    CLIENT_PERMISSIONS.CHAT_ACCESS,
    CLIENT_PERMISSIONS.NOTIFICATIONS,
    CLIENT_PERMISSIONS.PROFILE_EDIT,
    CLIENT_PERMISSIONS.SUPPORT_ACCESS,
    CLIENT_PERMISSIONS.SUPPORT_CREATE_TICKET
  ],
  'Enterprise Client': Object.values(CLIENT_PERMISSIONS) // All permissions
};

// Helper function to check if user has permission
export const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions && userPermissions.includes(requiredPermission);
};

// Helper function to check multiple permissions
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

// Helper function to get permissions by category
export const getPermissionsByCategory = (category) => {
  return PERMISSION_CATEGORIES[category] || [];
};
