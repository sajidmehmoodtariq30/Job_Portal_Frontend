import React from 'react';
import { usePermissions } from '@/context/PermissionsContext';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Lock } from 'lucide-react';

const PermissionGuard = ({ 
  permission, 
  permissions, 
  requireAll = false, 
  children, 
  fallback = null,
  showMessage = true,
  customMessage = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, getPermissionLabel } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (hasAccess) {
    return children;
  }

  // If access denied, show fallback or permission denied message
  if (fallback) {
    return fallback;
  }

  if (!showMessage) {
    return null;
  }

  const defaultMessage = customMessage || (
    permission 
      ? `You don't have permission to ${getPermissionLabel(permission).toLowerCase()}`
      : 'You don\'t have the required permissions to access this feature'
  );

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        {defaultMessage}
      </AlertDescription>
    </Alert>
  );
};

export default PermissionGuard;
