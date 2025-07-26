import React, { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useClientAssignment } from '@/context/ClientAssignmentContext';
import ClientAssignmentAlert from './ClientAssignmentAlert';

const ClientAssignmentGuard = ({ children }) => {
  const { user, isLoading } = useSession();
  const { hasValidAssignment, isValidating, forceRefresh } = useClientAssignment();

  // Debug logging
  useEffect(() => {
    console.log('🔍 ClientAssignmentGuard Status:', {
      user: user?.email,
      hasValidAssignment,
      isValidating,
      isLoading,
      assignedClientUuid: user?.assignedClientUuid
    });
  }, [user, hasValidAssignment, isValidating, isLoading]);

  // Only show loading for initial session load, not for background validation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // If no user, show assignment alert
  if (!user) {
    console.log('❌ No user found, showing alert');
    return (
      <ClientAssignmentAlert 
        userName="User"
        userEmail="Not provided"
        onRefresh={forceRefresh}
      />
    );
  }

  // If user exists but no valid assignment, show alert with background validation indicator
  if (!hasValidAssignment) {
    console.log('❌ No valid client assignment, showing alert');
    return (
      <div className="relative">
        <ClientAssignmentAlert 
          userName={user?.name || user?.username || user?.email || 'User'} 
          userEmail={user?.email || 'Not provided'}
          onRefresh={forceRefresh}
        />
        {/* Show subtle background validation indicator */}
        {isValidating && (
          <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Checking access...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  console.log('✅ Valid client assignment confirmed, rendering client portal');
  // If user has valid assignment, render children with optional background validation indicator
  return (
    <div className="relative">
      {children}
      {/* Show subtle background validation indicator when revalidating */}
      {isValidating && (
        <div className="fixed bottom-4 left-4 z-30 bg-blue-50 border border-blue-200 rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-700">Validating...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAssignmentGuard;
