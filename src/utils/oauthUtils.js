// OAuth URL utility to safely handle OAuth redirects
export const preProcessOAuthURL = () => {
  try {
    const currentURL = window.location.href;
    
    // Check if this is an OAuth callback with problematic parameters
    if (currentURL.includes('access_token=') && currentURL.includes('scope=')) {
      console.log('🔄 Pre-processing OAuth URL to prevent security errors...');
      
      // Extract OAuth parameters before they cause router issues
      const url = new URL(currentURL);
      const oauthData = {
        access_token: url.searchParams.get('access_token'),
        refresh_token: url.searchParams.get('refresh_token'),
        expires_in: url.searchParams.get('expires_in'),
        token_type: url.searchParams.get('token_type'),
        scope: url.searchParams.get('scope')
      };
      
      // Store in sessionStorage for retrieval after URL cleanup
      if (oauthData.access_token && oauthData.refresh_token) {
        sessionStorage.setItem('oauth_temp_data', JSON.stringify(oauthData));
        
        // Immediately redirect to clean URL to prevent router issues
        const cleanURL = `${url.origin}${url.pathname}?oauth_processing=true`;
        window.location.replace(cleanURL);
        return true; // Indicates we're processing OAuth
      }
    }
    
    // Check if we're in the OAuth processing state
    if (currentURL.includes('oauth_processing=true')) {
      const storedData = sessionStorage.getItem('oauth_temp_data');
      if (storedData) {
        const oauthData = JSON.parse(storedData);
        sessionStorage.removeItem('oauth_temp_data');
        
        // Clean the URL one more time
        const url = new URL(currentURL);
        const finalCleanURL = `${url.origin}${url.pathname}`;
        window.history.replaceState({}, '', finalCleanURL);
        
        // Store the OAuth data for the app to process
        sessionStorage.setItem('oauth_ready_data', JSON.stringify(oauthData));
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in pre-processing OAuth URL:', error);
    return false;
  }
};

export const getProcessedOAuthData = () => {
  try {
    const data = sessionStorage.getItem('oauth_ready_data');
    if (data) {
      sessionStorage.removeItem('oauth_ready_data');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error retrieving processed OAuth data:', error);
  }
  return null;
};

export const cleanOAuthURL = () => {
  try {
    const url = new URL(window.location.href);
    const oauthParams = [
      'access_token',
      'refresh_token', 
      'expires_in',
      'token_type',
      'scope',
      'state',
      'code',
      'oauth_processing'
    ];
    
    // Remove all OAuth-related parameters
    oauthParams.forEach(param => {
      url.searchParams.delete(param);
    });
    
    // Use the cleaned URL
    const cleanUrl = url.toString();
    
    // Only update if the URL actually changed
    if (cleanUrl !== window.location.href) {
      window.history.replaceState(null, '', cleanUrl);
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('Error cleaning OAuth URL:', error);
    
    // Fallback: Just use the base URL without any parameters
    try {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState(null, '', baseUrl);
      return baseUrl;
    } catch (fallbackError) {
      console.error('Fallback URL cleaning also failed:', fallbackError);
      return window.location.href;
    }
  }
};

export const extractOAuthParams = (searchParams) => {
  const params = {};
  const oauthFields = [
    'access_token',
    'refresh_token',
    'expires_in', 
    'token_type',
    'scope',
    'state',
    'code'
  ];
  
  oauthFields.forEach(field => {
    const value = searchParams.get(field);
    if (value) {
      params[field] = value;
    }
  });
  
  return params;
};
