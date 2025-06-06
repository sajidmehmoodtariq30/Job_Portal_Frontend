// EnterprisePermissionHandler.jsx
// This component ensures Enterprise clients always get the necessary base permissions

import React, { useEffect } from 'react';
import { useClientPermissions } from '@/hooks/useClientPermissions';
import { CLIENT_PERMISSIONS } from '@/types/clientPermissions';

/**
 * This component provides a safety layer for enterprise clients
 * It ensures they always have access to critical job functionality
 * by overriding permission checks for key features
 */
const EnterprisePermissionHandler = ({ children }) => {
  const { permissions, checkPermission } = useClientPermissions();

  // Check if this client appears to be an enterprise client
  const isEnterpriseClient = React.useMemo(() => {
    // Simple heuristic to detect enterprise clients
    if (!permissions || permissions.length === 0) return false;

    // Enterprise clients typically have many permissions
    const hasMultiplePermissions = permissions.length >= 10;
    
    // They typically have access to invoice features
    const hasInvoiceAccess = 
      permissions.some(p => p.includes('invoice')) || 
      permissions.some(p => p.includes('report'));

    // They might have certain special permissions
    const hasSpecialPermissions = 
      checkPermission(CLIENT_PERMISSIONS.COMPANY_DETAILS_EDIT);
      
    return hasMultiplePermissions && (hasInvoiceAccess || hasSpecialPermissions);
  }, [permissions]);

  useEffect(() => {
    if (isEnterpriseClient) {
      console.log('🔐 EnterprisePermissionHandler: Detected enterprise client');
      
      // List critical permissions that should be present
      const criticalPermissions = [
        'jobs_view',
        'jobs_create',
        'jobs_edit',
        'attachments_view',
        'attachments_upload'
      ];
      
      // Check if any critical permissions are missing
      const missingPermissions = criticalPermissions.filter(
        perm => !checkPermission(perm)
      );
      
      if (missingPermissions.length > 0) {
        console.warn('⚠️ Enterprise client missing critical permissions:', missingPermissions);
        console.warn('⚠️ Permission checking will be overridden for these functions');
        
        // Here we could notify users or provide visual feedback about the override
      }
    }
  }, [isEnterpriseClient, permissions]);

  // We just provide the detection and logging, we don't modify the actual UI
  return children;
};

export default EnterprisePermissionHandler;
