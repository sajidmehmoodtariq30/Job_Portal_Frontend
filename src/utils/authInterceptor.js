import axios from 'axios';

// Create axios interceptor to handle authentication and access control
const setupAuthInterceptor = (navigate) => {
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
        
        // Clear all stored client data
        localStorage.removeItem('client_data');
        localStorage.removeItem('client_email');
        
        // Show user notification
        alert('Your account has been deactivated. You will be redirected to the login page.');
        
        // Redirect to login page
        if (navigate) {
          navigate('/login');
        } else {
          // Fallback if navigate is not available
          window.location.href = '/login';
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

// Function to check if client is logged in and account is potentially active
export const isClientLoggedIn = () => {
  const clientData = localStorage.getItem('client_data');
  return !!clientData;
};

// Function to get client UUID from stored data
export const getClientUuid = () => {
  try {
    const clientData = localStorage.getItem('client_data');
    if (clientData) {
      const parsed = JSON.parse(clientData);
      return parsed.uuid;
    }
  } catch (error) {
    console.error('Error parsing client data:', error);
  }
  return null;
};

// Function to add client UUID header to requests
export const addClientUuidHeader = () => {
  const clientUuid = getClientUuid();
  if (clientUuid) {
    axios.defaults.headers.common['x-client-uuid'] = clientUuid;
  }
};

// Function to remove client UUID header
export const removeClientUuidHeader = () => {
  delete axios.defaults.headers.common['x-client-uuid'];
};

export default setupAuthInterceptor;
