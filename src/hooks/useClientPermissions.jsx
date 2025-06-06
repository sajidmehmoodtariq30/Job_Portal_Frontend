import { useState, useEffect, createContext, useContext } from 'react';
import { hasPermission, hasAnyPermission, CLIENT_PERMISSIONS } from '@/types/clientPermissions';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const ClientPermissionContext = createContext();

export const ClientPermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const clientData = localStorage.getItem('client_data');
        console.log('🔐 Raw client_data from localStorage:', clientData);
        
        if (!clientData) {
          console.log('🔐 No client data found in localStorage');
          setPermissions([]);
          setLoading(false);
          return;
        }

        const parsedData = JSON.parse(clientData);
        const clientId = parsedData.uuid;
        console.log('🔐 Parsed client data:', parsedData);
        console.log('🔐 Using clientId for permissions:', clientId);

        const url = API_ENDPOINTS.CLIENTS.GET_PERMISSIONS(clientId);
        console.log('🔐 Fetching permissions from URL:', url);

        const response = await axios.get(url);
        console.log('🔐 Permission API response:', response.data);
        
        setPermissions(response.data.permissions || []);
      } catch (err) {
        console.error('🔐 Error fetching client permissions:', err);
        setError(err.message);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);  const checkPermission = (permission) => {
    // For debugging permission issues
    let permDebugName = permission;
    // Find the permission key by its value
    for (const [key, value] of Object.entries(CLIENT_PERMISSIONS)) {
      if (value === permission) {
        permDebugName = `${key} (${value})`;
        break;
      }
    }
    
    const result = hasPermission(permissions, permission);
    console.log(`🔐 Checking permission: ${permDebugName}, Result: ${result}`);
    console.log(`🔐 Available permissions: ${permissions.join(', ')}`);
    
    // Enterprise clients always have access to core features
    const isEnterpriseClient = permissions.length > 15; // Simple heuristic
    if (isEnterpriseClient && ['jobs_view', 'jobs_create', 'dashboard_view'].includes(permission)) {
      console.log(`🔐 Enterprise client override for ${permDebugName}`);
      return true;
    }
    
    return result;
  };

  const checkAnyPermission = (permissionList) => {
    if (!permissionList || !Array.isArray(permissionList)) {
      console.error('🔐 Invalid permission list:', permissionList);
      return false;
    }
    
    const result = hasAnyPermission(permissions, permissionList);
    console.log(`🔐 Checking any permissions: ${permissionList.join(', ')}, Result: ${result}`);
    return result;
  };  // Special check for critical job management permissions that might exist under different keys
  const checkJobPermission = () => {
    const hasJobsView = checkPermission(CLIENT_PERMISSIONS.JOBS_VIEW) || checkPermission(CLIENT_PERMISSIONS.VIEW_JOBS);
    const hasJobsCreate = checkPermission(CLIENT_PERMISSIONS.JOBS_CREATE);
    const hasManageAttachments = checkPermission(CLIENT_PERMISSIONS.ATTACHMENTS_UPLOAD) || 
                                checkPermission(CLIENT_PERMISSIONS.MANAGE_ATTACHMENTS);
    
    // Add robust enterprise detection
    const isEnterpriseClient = permissions.some(p => p.includes('invoice')) && permissions.length > 10;
    
    console.log(`🔐 Job permissions check: view=${hasJobsView}, create=${hasJobsCreate}, attachments=${hasManageAttachments}`);
    console.log(`🔐 Is enterprise client: ${isEnterpriseClient}`);
    
    // Enterprise clients should always have job access
    return {
      canViewJobs: hasJobsView || isEnterpriseClient,
      canCreateJobs: hasJobsCreate || isEnterpriseClient,
      canManageAttachments: hasManageAttachments || isEnterpriseClient,
      isEnterprise: isEnterpriseClient
    };
  };

  const value = {
    permissions,
    loading,
    error,
    checkPermission,
    hasPermission: checkPermission, // Alias for compatibility
    checkAnyPermission,
    checkJobPermission // New helper specifically for job permissions
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
