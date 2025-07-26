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
      // Clear any previous dismissal when user becomes unmapped
      sessionStorage.removeItem('client_linking_dismissed');
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
    <div className="fixed bottom-4 left-4 z-30 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-md p-3 transition-all duration-300">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-amber-800 text-sm mb-1">
              Client Not Linked
            </div>
            <div className="text-xs text-amber-700 mb-2">
              Contact admin to assign client access
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-amber-700 border-amber-300 hover:bg-amber-100 h-6 px-2 text-xs"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-2 w-2 mr-1 animate-spin" />
                    Checking
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-2 w-2 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLinkingNotification;
