import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import backgroundValidationService from '@/services/BackgroundValidationService';

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

  // Initialize with local check to avoid blocking UI
  useEffect(() => {
    if (user && user.assignedClientUuid && user.assignedClientUuid !== 'none') {
      console.log('🔍 Initial local check: User has assigned client UUID');
      setHasValidAssignment(true);
    } else {
      console.log('🔍 Initial local check: No valid client assignment');
      setHasValidAssignment(false);
    }
  }, [user?.assignedClientUuid]);

  // Validate client assignment with backend using background service
  const validateAssignment = useCallback(async (forceRefresh = false) => {
    if (!user || !user.email) {
      setHasValidAssignment(false);
      return false;
    }

    // Use background validation service to prevent UI blocking
    const validationFn = async () => {
      setIsValidating(true);
      
      try {
        console.log('🔍 BACKGROUND VALIDATION: Running client access check for:', user.email);
        
        const response = await axios.get(API_ENDPOINTS.CLIENT_VALIDATION.VALIDATE_ASSIGNMENT, {
          headers: { 'x-user-email': user.email },
          params: { email: user.email }
        });

        if (response.data.success) {
          const serverHasAssignment = response.data.hasClientAssignment;
          const serverClientUuid = response.data.user?.assignedClientUuid;
          
          console.log('🔍 Background validation result:', {
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
          setLastValidationTime(Date.now());
          return serverHasAssignment;
        } else {
          console.log('❌ Background validation failed');
          setHasValidAssignment(false);
          setLastValidationTime(Date.now());
          return false;
        }
      } catch (error) {
        console.error('❌ Error in background validation:', error);
        // Fallback to local check if server is unreachable
        const localHasAssignment = !!(user.assignedClientUuid && user.assignedClientUuid !== 'none');
        setHasValidAssignment(localHasAssignment);
        setLastValidationTime(Date.now());
        return localHasAssignment;
      } finally {
        setIsValidating(false);
      }
    };

    return backgroundValidationService.queueValidation(
      'clientAssignment',
      validationFn,
      { force: forceRefresh }
    );
  }, [user, updateUserData]);

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

    // Run initial validation after a short delay to allow UI to render first
    setTimeout(() => {
      runValidation();
    }, 2000);    // Set up periodic validation every 20 minutes (reduced frequency)
    intervalId = setInterval(runValidation, 1200000);

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
      if (lastValidationTime && (now - lastValidationTime) < 300000) { // 5 minutes
        console.log('🔍 Window focused but skipping validation - validated recently');
        return;
      }
      
      console.log('🔍 Window focused, will re-validate client assignment after delay');
      // Add a 10-second delay to avoid disrupting the user when returning to tab
      setTimeout(() => {
        validateAssignment(true);
      }, 10000);
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
