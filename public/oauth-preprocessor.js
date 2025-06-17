// Pre-process OAuth URLs before React Router loads
// This prevents the SecurityError from occurring

(function() {
  'use strict';
  
  console.log('🚀 OAuth pre-processor loaded');
  
  function preProcessOAuth() {
    try {
      const currentURL = window.location.href;
      
      // Check if this is an OAuth callback with problematic parameters
      if (currentURL.includes('access_token=') && currentURL.includes('scope=')) {
        console.log('🔄 Detected OAuth callback, pre-processing...');
        
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
          console.log('🧹 Redirecting to clean URL:', cleanURL);
          window.location.replace(cleanURL);
          return;
        }
      }
      
      // Check if we're in the OAuth processing state
      if (currentURL.includes('oauth_processing=true')) {
        console.log('🔄 Processing stored OAuth data...');
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
          console.log('✅ OAuth data processed and stored');
        }
      }
    } catch (error) {
      console.error('❌ Error in OAuth pre-processing:', error);
    }
  }
  
  // Run immediately
  preProcessOAuth();
})();
