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

  // Show loading state while checking session or validating
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading session...' : 'Validating client access...'}
          </p>
        </div>
      </div>
    );
  }

  // If no user or no valid assignment, show the assignment alert
  if (!user || !hasValidAssignment) {
    console.log('❌ No valid client assignment, showing alert');
    return (
      <ClientAssignmentAlert 
        userName={user?.name || user?.username || user?.email || 'User'} 
        userEmail={user?.email || 'Not provided'}
        onRefresh={forceRefresh}
      />
    );
  }

  console.log('✅ Valid client assignment confirmed, rendering client portal');
  // If user has valid assignment, render the children (normal client components)
  return <>{children}</>;
};

export default ClientAssignmentGuard;
