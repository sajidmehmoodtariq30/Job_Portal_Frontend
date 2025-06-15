import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const ClientAssignmentContext = createContext({});

export { ClientAssignmentContext };

export const useClientAssignment = () => {
  const context = useContext(ClientAssignmentContext);
  if (!context) {
    throw new Error('useClientAssignment must be used within a ClientAssignmentProvider');
  }
  return context;
};

export const ClientAssignmentProvider = ({ children }) => {
  const { user, updateUserData } = useSession();
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidAssignment, setHasValidAssignment] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState(null);

  // Validate client assignment with backend
  const validateAssignment = useCallback(async (forceRefresh = false) => {
    if (!user || !user.email) {
      setHasValidAssignment(false);
      return false;
    }    // Don't validate too frequently unless forced
    const now = Date.now();
    if (!forceRefresh && lastValidationTime && (now - lastValidationTime) < 60000) { // Increased from 10s to 60s (1 minute)
      console.log('🔍 Skipping validation - too recent (less than 1 minute ago)');
      return hasValidAssignment;
    }

    setIsValidating(true);
    
    try {
      console.log('🔍 VALIDATION: Running client access check for:', user.email, 
        'Force:', forceRefresh, 
        'Time since last check:', lastValidationTime ? `${Math.floor((now - lastValidationTime) / 1000)}s ago` : 'First check');
      
      const response = await axios.get(API_ENDPOINTS.CLIENT_VALIDATION.VALIDATE_ASSIGNMENT, {
        headers: { 'x-user-email': user.email },
        params: { email: user.email }
      });

      if (response.data.success) {
        const serverHasAssignment = response.data.hasClientAssignment;
        const serverClientUuid = response.data.user?.assignedClientUuid;
        
        console.log('🔍 Server validation result:', {
          hasAssignment: serverHasAssignment,
          clientUuid: serverClientUuid,
          localClientUuid: user.assignedClientUuid
        });

        // Update local user data if server data is different
        if (serverClientUuid !== user.assignedClientUuid) {
          console.log('🔄 Updating local user data with server data');
          const updatedUser = { ...user, assignedClientUuid: serverClientUuid };
          updateUserData(updatedUser);
        }

        setHasValidAssignment(serverHasAssignment);
        setLastValidationTime(now);
        return serverHasAssignment;
      } else {
        console.log('❌ Server validation failed');
        setHasValidAssignment(false);
        setLastValidationTime(now);
        return false;
      }
    } catch (error) {
      console.error('❌ Error validating client assignment:', error);
      // Fallback to local check if server is unreachable
      const localHasAssignment = !!(user.assignedClientUuid && user.assignedClientUuid !== 'none');
      setHasValidAssignment(localHasAssignment);
      setLastValidationTime(now);
      return localHasAssignment;
    } finally {
      setIsValidating(false);
    }
  }, [user, updateUserData]); // Removed hasValidAssignment and lastValidationTime from deps to prevent loop

  // Initial validation and periodic checks
  useEffect(() => {
    if (!user || !user.email) return;

    let isFirstRun = true;
    let intervalId;

    const runValidation = async () => {
      try {
        await validateAssignment(isFirstRun);
        isFirstRun = false;
      } catch (error) {
        console.error('❌ Error in periodic validation:', error);
      }
    };

    // Run initial validation
    runValidation();    // Set up periodic validation every 5 minutes (increased from 30 seconds)
    intervalId = setInterval(runValidation, 300000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.email]); // Only depend on user.email to prevent recreation
  // Listen for window focus to re-validate (in case admin changed assignment in another tab)
  // But add a delay and check elapsed time since last validation
  useEffect(() => {
    const handleFocus = () => {
      // Check if we've validated recently
      const now = Date.now();
      if (lastValidationTime && (now - lastValidationTime) < 180000) { // 3 minutes
        console.log('🔍 Window focused but skipping validation - validated recently');
        return;
      }
      
      console.log('🔍 Window focused, will re-validate client assignment after short delay');
      // Add a 3-second delay to avoid disrupting the user immediately when returning to tab
      setTimeout(() => {
        validateAssignment(true);
      }, 3000);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.email, lastValidationTime]); // Added lastValidationTime dependency  // Force refresh function for manual validation
  const forceRefresh = useCallback(() => {
    console.log('🔄 VALIDATION: Manual refresh requested by user');
    // For manual refreshes, we'll always update the timestamp even before the request
    // to prevent multiple rapid clicks
    setLastValidationTime(Date.now());
    return validateAssignment(true);
  }, [validateAssignment]);

  // Function to get client ID
  const getClientId = useCallback(() => {
    return user?.assignedClientUuid || null;
  }, [user?.assignedClientUuid]);

  const value = {
    hasValidAssignment,
    isValidating,
    validateAssignment,
    forceRefresh,
    lastValidated: lastValidationTime,
    getClientId
  };

  return (
    <ClientAssignmentContext.Provider value={value}>
      {children}
    </ClientAssignmentContext.Provider>
  );
};

export default ClientAssignmentProvider;
