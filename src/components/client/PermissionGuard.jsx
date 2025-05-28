import React from 'react';
import { useClientPermissions } from '@/hooks/useClientPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  requiredPermissions, 
  requireAll = false,
  fallback = null 
}) => {
  const { checkPermission, checkAnyPermission, loading } = useClientPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = checkPermission(requiredPermission);
  } else if (requiredPermissions) {
    if (requireAll) {
      hasAccess = requiredPermissions.every(permission => checkPermission(permission));
    } else {
      hasAccess = checkAnyPermission(requiredPermissions);
    }
  } else {
    // No permissions required, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            You don't have permission to access this feature. Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    );
  }

  return children;
};

export default PermissionGuard;
