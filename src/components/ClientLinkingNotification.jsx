import React, { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Button } from '@/components/UI/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

const ClientLinkingNotification = () => {
  const { user, hasAssignedClient, refreshUserData } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user && !hasAssignedClient()) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, hasAssignedClient]);

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

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    sessionStorage.setItem('client_linking_dismissed', 'true');
  };

  // Don't show if dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('client_linking_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="pr-8">
          <div className="space-y-2">
            <div className="font-medium text-amber-800">
              Client Not Linked
            </div>
            <div className="text-sm text-amber-700">
              Your account is not currently linked to any client. Please contact your administrator to assign you to a client to access full functionality.
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Check Again
                  </>
                )}
              </Button>
            </div>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-amber-600 hover:bg-amber-100"
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  );
};

export default ClientLinkingNotification;
