import React from 'react';
import { usePermissions } from '@/context/PermissionsContext';
import { useSession } from '@/context/SessionContext';

// Utility functions for cross-tab/window real-time updates
export const NOTIFICATION_TYPES = {
  PERMISSIONS_UPDATED: 'permissions_updated',
  CLIENT_MAPPING_UPDATED: 'client_mapping_updated',
  USER_STATUS_UPDATED: 'user_status_updated'
};

// Trigger a real-time notification
export const triggerRealTimeUpdate = (type, data = {}) => {
  const notification = {
    type,
    data,
    timestamp: Date.now(),
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  // Use localStorage event to notify other tabs/windows
  localStorage.setItem('realtime_notification', JSON.stringify(notification));
  
  // Remove immediately (this triggers the storage event)
  localStorage.removeItem('realtime_notification');

  // Also trigger custom event for same window
  window.dispatchEvent(new CustomEvent('realtimeUpdate', { detail: notification }));
};

// Listen for real-time notifications
export const useRealTimeUpdates = (callback) => {
  React.useEffect(() => {
    // Handle storage events (cross-tab notifications)
    const handleStorageChange = (event) => {
      if (event.key === 'realtime_notification' && event.newValue) {
        try {
          const notification = JSON.parse(event.newValue);
          callback(notification);
        } catch (error) {
          console.error('Error parsing real-time notification:', error);
        }
      }
    };

    // Handle custom events (same window notifications)
    const handleCustomEvent = (event) => {
      callback(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('realtimeUpdate', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('realtimeUpdate', handleCustomEvent);
    };
  }, [callback]);
};

// Hook for handling permissions updates
export const usePermissionsUpdateListener = () => {
  const { refreshPermissions } = usePermissions();
  const { refreshUserData, user } = useSession();

  const handleNotification = React.useCallback(async (notification) => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.PERMISSIONS_UPDATED:
        // Check if it's for current user
        if (notification.data.userId === user?.uuid) {
          console.log('Permissions updated for current user, refreshing...');
          await refreshPermissions();
        }
        break;
        
      case NOTIFICATION_TYPES.CLIENT_MAPPING_UPDATED:
        // Check if it's for current user
        if (notification.data.userId === user?.uuid) {
          console.log('Client mapping updated for current user, refreshing...');
          await refreshUserData();
        }
        break;
        
      case NOTIFICATION_TYPES.USER_STATUS_UPDATED:
        // Check if it's for current user
        if (notification.data.userId === user?.uuid) {
          console.log('User status updated for current user, refreshing...');
          await refreshUserData();
        }        break;
        
      default:
        break;
    }
  }, [refreshPermissions, refreshUserData, user]);

  useRealTimeUpdates(handleNotification);
};
