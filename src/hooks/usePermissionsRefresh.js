import { useEffect, useRef } from 'react';
import { usePermissions } from '@/context/PermissionsContext';
import { useSession } from '@/context/SessionContext';

// Custom hook for auto-refreshing permissions
export const usePermissionsRefresh = (intervalMs = 1800000) => { // Default 30 minutes
  const { refreshPermissions } = usePermissions();
  const { isUser } = useSession();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isUser()) {
      // Set up periodic refresh
      intervalRef.current = setInterval(() => {
        refreshPermissions();
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isUser, refreshPermissions, intervalMs]);

  // Manual refresh function
  const manualRefresh = async () => {
    if (isUser()) {
      await refreshPermissions();
    }
  };

  return { manualRefresh };
};

// Hook for visibility change refresh (when user comes back to tab)
export const useVisibilityRefresh = () => {
  const { refreshPermissions } = usePermissions();
  const { refreshUserData, isUser } = useSession();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isUser()) {
        // User came back to the tab, refresh data
        await Promise.all([
          refreshPermissions(),
          refreshUserData()
        ]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshPermissions, refreshUserData, isUser]);

  return null;
};

// Hook for window focus refresh
export const useFocusRefresh = () => {
  const { refreshPermissions } = usePermissions();
  const { refreshUserData, isUser } = useSession();

  useEffect(() => {
    const handleFocus = async () => {
      if (isUser()) {
        await Promise.all([
          refreshPermissions(),
          refreshUserData()
        ]);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshPermissions, refreshUserData, isUser]);

  return null;
};
