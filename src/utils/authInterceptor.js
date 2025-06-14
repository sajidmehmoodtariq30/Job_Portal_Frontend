import axios from 'axios';

// Create axios interceptor to handle authentication and access control
const setupAuthInterceptor = (navigate, sessionContext) => {
  // Response interceptor to handle global error conditions
  axios.interceptors.response.use(
    (response) => {
      // Return successful responses as-is
      return response;
    },
    (error) => {
      // Handle specific error codes globally
      if (error.response?.status === 403 && 
          error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        
        // Account has been deactivated
        console.log('Account deactivated, logging out user');
        
        // Use session context to handle logout
        if (sessionContext) {
          if (sessionContext.isAdmin()) {
            sessionContext.handleAdminLogout('Account deactivated');
          } else if (sessionContext.isUser()) {
            sessionContext.handleUserLogout('Account deactivated');
          }
        } else {
          // Fallback for backward compatibility
          localStorage.clear();
          if (navigate) {
            navigate('/login');
          } else {
            window.location.href = '/login';
          }
        }
        
        // Show user notification
        alert('Your account has been deactivated. You will be redirected to the login page.');
        
        return Promise.reject(error);
      }
      
      // Handle unauthorized access
      if (error.response?.status === 401) {
        console.log('Unauthorized access, session may be expired');
        
        // Use session context to handle logout
        if (sessionContext) {
          if (sessionContext.isAdmin()) {
            sessionContext.handleAdminLogout('Session expired or unauthorized');
          } else if (sessionContext.isUser()) {
            sessionContext.handleUserLogout('Session expired or unauthorized');
          }
        }
        
        return Promise.reject(error);
      }
      
      // Handle other access verification failures
      if (error.response?.status === 403 && 
          error.response?.data?.code === 'ACCESS_VERIFICATION_FAILED') {
        
        console.log('Access verification failed');
        alert('Unable to verify account access. Please refresh the page and try again.');
        
        return Promise.reject(error);
      }
      
      // For all other errors, pass them through
      return Promise.reject(error);
    }
  );
};

// Function to check if client is logged in (backward compatibility)
export const isClientLoggedIn = () => {
  const clientData = localStorage.getItem('client_data') || localStorage.getItem('user_data');
  const sessionData = localStorage.getItem('user_session');
  
  if (!clientData || !sessionData) return false;
  
  try {
    const session = JSON.parse(sessionData);
    return Date.now() < session.expiresAt;
  } catch (error) {
    console.error('Error checking client login status:', error);
    return false;
  }
};

// Function to check if admin is logged in (backward compatibility)
export const isAdminLoggedIn = () => {
  const adminToken = localStorage.getItem('admin_token');
  const sessionData = localStorage.getItem('admin_session');
  
  if (!adminToken || !sessionData) return false;
  
  try {
    const session = JSON.parse(sessionData);
    return Date.now() < session.expiresAt;
  } catch (error) {
    console.error('Error checking admin login status:', error);
    return false;
  }
};

// Function to get client UUID from stored data (backward compatibility)
export const getClientUuid = () => {
  try {
    const clientData = localStorage.getItem('client_data') || localStorage.getItem('user_data');
    if (clientData) {
      const parsed = JSON.parse(clientData);
      return parsed.uuid;
    }
  } catch (error) {
    console.error('Error parsing client data:', error);
  }
  return null;
};

// Function to add client UUID header to requests (backward compatibility)
export const addClientUuidHeader = () => {
  const clientUuid = getClientUuid();
  if (clientUuid) {
    axios.defaults.headers.common['x-client-uuid'] = clientUuid;
  }
};

// Function to remove client UUID header (backward compatibility)
export const removeClientUuidHeader = () => {
  delete axios.defaults.headers.common['x-client-uuid'];
};

// Function to add admin token header to requests (backward compatibility)
export const addAdminTokenHeader = () => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      const tokenData = JSON.parse(adminToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`;
    }
  } catch (error) {
    console.error('Error adding admin token header:', error);
  }
};

// Function to remove admin token header (backward compatibility)
export const removeAdminTokenHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

export default setupAuthInterceptor;
