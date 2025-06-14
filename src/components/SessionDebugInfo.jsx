import React from 'react';
import { useSession } from '@/context/SessionContext';

const SessionDebugInfo = () => {
  const { admin, user, isLoading, sessionExpiry, isAuthenticated, isAdmin, isUser } = useSession();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Session Debug Info</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</div>
      <div>Is Admin: {isAdmin() ? 'Yes' : 'No'}</div>
      <div>Is User: {isUser() ? 'Yes' : 'No'}</div>
      <div>Admin Token: {admin ? 'Present' : 'None'}</div>
      <div>User Data: {user ? 'Present' : 'None'}</div>
      <div>Session Expiry: {sessionExpiry ? new Date(sessionExpiry).toLocaleTimeString() : 'None'}</div>
      
      {admin && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="font-semibold">Admin Info:</div>
          <div>Session ID: {admin.sessionId?.slice(-8) || 'N/A'}</div>
          <div>Login Time: {admin.loginTime ? new Date(admin.loginTime).toLocaleTimeString() : 'N/A'}</div>
        </div>
      )}
      
      {user && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="font-semibold">User Info:</div>
          <div>Name: {user.name || 'N/A'}</div>
          <div>Email: {user.email || 'N/A'}</div>
          <div>Session ID: {user.sessionId?.slice(-8) || 'N/A'}</div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="font-semibold">LocalStorage:</div>
        <div>admin_token: {localStorage.getItem('admin_token') ? 'Present' : 'None'}</div>
        <div>admin_session: {localStorage.getItem('admin_session') ? 'Present' : 'None'}</div>
        <div>user_data: {localStorage.getItem('user_data') ? 'Present' : 'None'}</div>
        <div>user_session: {localStorage.getItem('user_session') ? 'Present' : 'None'}</div>
      </div>
    </div>
  );
};

export default SessionDebugInfo;
