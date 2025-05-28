import { useState, useEffect, createContext, useContext } from 'react';
import { hasPermission, hasAnyPermission } from '@/types/clientPermissions';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const ClientPermissionContext = createContext();

export const ClientPermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const clientId = localStorage.getItem('client_id');
        if (!clientId) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        const response = await axios.get(API_ENDPOINTS.CLIENTS.GET_PERMISSIONS(clientId));
        setPermissions(response.data.permissions || []);
      } catch (err) {
        console.error('Error fetching client permissions:', err);
        setError(err.message);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const checkPermission = (permission) => {
    return hasPermission(permissions, permission);
  };

  const checkAnyPermission = (permissionList) => {
    return hasAnyPermission(permissions, permissionList);
  };
  const value = {
    permissions,
    loading,
    error,
    checkPermission,
    hasPermission: checkPermission, // Alias for compatibility
    checkAnyPermission
  };

  return (
    <ClientPermissionContext.Provider value={value}>
      {children}
    </ClientPermissionContext.Provider>
  );
};

export const useClientPermissions = () => {
  const context = useContext(ClientPermissionContext);
  if (!context) {
    throw new Error('useClientPermissions must be used within a ClientPermissionProvider');
  }
  return context;
};
