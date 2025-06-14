import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const PermissionsContext = createContext({});

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Available permissions
export const PERMISSIONS = {
  VIEW_JOBS: 'view_jobs',
  CREATE_JOBS: 'create_jobs',
  ADD_NOTES_ATTACHMENTS: 'add_notes_attachments',
  ACCEPT_REJECT_QUOTES: 'accept_reject_quotes',
  VIEW_SITES: 'view_sites',
  REQUEST_WORK: 'request_work'
};

// Permission labels for UI
export const PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_JOBS]: 'View Jobs',
  [PERMISSIONS.CREATE_JOBS]: 'Create Jobs', 
  [PERMISSIONS.ADD_NOTES_ATTACHMENTS]: 'Add Notes/Attachments to Jobs',
  [PERMISSIONS.ACCEPT_REJECT_QUOTES]: 'Accept/Reject Quotes',
  [PERMISSIONS.VIEW_SITES]: 'View Sites',
  [PERMISSIONS.REQUEST_WORK]: 'Request Work per Site'
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.VIEW_JOBS]: 'Allow user to view job listings and details',
  [PERMISSIONS.CREATE_JOBS]: 'Allow user to create new job requests',
  [PERMISSIONS.ADD_NOTES_ATTACHMENTS]: 'Allow user to add notes and attachments to existing jobs',
  [PERMISSIONS.ACCEPT_REJECT_QUOTES]: 'Allow user to accept or reject job quotes',
  [PERMISSIONS.VIEW_SITES]: 'Allow user to view site information and details',
  [PERMISSIONS.REQUEST_WORK]: 'Allow user to request work for specific sites'
};

export const PermissionsProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isUser, isAdmin } = useSession();

  // Load user permissions when user changes
  useEffect(() => {
    if (isUser() && user) {
      loadUserPermissions();
    } else if (isAdmin()) {
      // Admins have all permissions
      setUserPermissions(Object.values(PERMISSIONS));
      setIsLoading(false);
    } else {
      setUserPermissions([]);
      setIsLoading(false);
    }
  }, [user, isUser, isAdmin]);
  const loadUserPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Get user ID from localStorage
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setUserPermissions([]);
        return;
      }

      const parsedUser = JSON.parse(userData);
      const userId = parsedUser.uuid || parsedUser.userUuid;

      if (!userId) {
        setUserPermissions([]);
        return;
      }

      // Fetch permissions from API
      const response = await axios.get(API_ENDPOINTS.USERS.GET_PERMISSIONS(userId));
      
      if (response.data?.success) {
        const permissions = response.data.data.permissions || [];
        setUserPermissions(Array.isArray(permissions) ? permissions : []);
        
        // Also update localStorage for offline fallback
        const updatedUserData = {
          ...parsedUser,
          permissions: permissions
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      } else {
        // Fallback to localStorage if API fails
        const permissions = parsedUser.permissions || [];
        setUserPermissions(Array.isArray(permissions) ? permissions : []);
      }
    } catch (error) {
      console.error('Error loading user permissions from API:', error);
      
      // Fallback to localStorage
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const permissions = parsedUser.permissions || [];
          setUserPermissions(Array.isArray(permissions) ? permissions : []);
        }
      } catch (fallbackError) {
        console.error('Error loading fallback permissions:', fallbackError);
        setUserPermissions([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // Admins have all permissions
    if (isAdmin()) return true;
    
    // Users need explicit permissions
    return userPermissions.includes(permission);
  };

  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions) => {
    if (isAdmin()) return true;
    return permissions.some(permission => userPermissions.includes(permission));
  };

  // Check if user has all of the provided permissions
  const hasAllPermissions = (permissions) => {
    if (isAdmin()) return true;
    return permissions.every(permission => userPermissions.includes(permission));
  };

  // Get permission label
  const getPermissionLabel = (permission) => {
    return PERMISSION_LABELS[permission] || permission;
  };

  // Get permission description
  const getPermissionDescription = (permission) => {
    return PERMISSION_DESCRIPTIONS[permission] || '';
  };
  // Update user permissions (used after user profile updates)
  const updateUserPermissions = (newPermissions) => {
    setUserPermissions(Array.isArray(newPermissions) ? newPermissions : []);
    
    // Also update localStorage
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const updatedUserData = {
          ...parsedUser,
          permissions: newPermissions
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error('Error updating user permissions in localStorage:', error);
    }
  };

  // Refresh permissions from API (can be called to get latest permissions)
  const refreshPermissions = async () => {
    if (isUser() && user) {
      await loadUserPermissions();
    }
  };

  const value = {
    // State
    userPermissions,
    isLoading,    // Methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionLabel,
    getPermissionDescription,
    updateUserPermissions,
    loadUserPermissions,
    refreshPermissions,

    // Constants
    PERMISSIONS,
    PERMISSION_LABELS,
    PERMISSION_DESCRIPTIONS
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
