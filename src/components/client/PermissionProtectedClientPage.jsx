import React from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const PermissionProtectedClientPage = ({ 
  permission, 
  permissions, 
  requireAll = false,
  children,
  title = "Access Restricted"
}) => {
  const { hasAssignedClient, refreshUserData } = useSession();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
      // Give a small delay to see the refresh effect
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setIsRefreshing(false);
    }
  };

  // If user is not linked to any client, show special message
  if (!hasAssignedClient()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-amber-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle className="text-amber-800">Client Not Linked</CardTitle>
            <CardDescription className="text-amber-700">
              Your account is not currently linked to any client
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              To access the {title} section, you need to be assigned to a client. 
              Please contact your administrator to link your account to a client.
            </p>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard 
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      customMessage={`You don't have permission to access the ${title} section. Please contact your administrator for assistance.`}
    >
      {children}
    </PermissionGuard>
  );
};

export default PermissionProtectedClientPage;
