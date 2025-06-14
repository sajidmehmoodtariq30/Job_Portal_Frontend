import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';

// Admin Protected Route
export const AdminProtectedRoute = ({ children }) => {
  const { admin, isLoading } = useSession();
  const location = useLocation();

  // Also check localStorage directly as a fallback
  const hasAdminToken = React.useMemo(() => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      const adminSession = localStorage.getItem('admin_session');
      
      if (adminToken && adminSession) {
        const sessionData = JSON.parse(adminSession);
        const now = Date.now();
        return now < sessionData.expiresAt; // Check if session is still valid
      }
      return false;
    } catch (error) {
      console.error('Error checking admin token from localStorage:', error);
      return false;
    }
  }, []);

  console.log('AdminProtectedRoute check:', { 
    admin: !!admin, 
    hasAdminToken, 
    isLoading, 
    location: location.pathname 
  });

  if (isLoading) {
    console.log('AdminProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check both admin state and localStorage fallback
  if (!admin && !hasAdminToken) {
    console.log('AdminProtectedRoute: No admin session found, redirecting to login');
    // Redirect to login with return path
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  console.log('AdminProtectedRoute: Admin session valid, rendering children');
  return children;
};

// Client Protected Route
export const ClientProtectedRoute = ({ children }) => {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return path
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

// General Protected Route (legacy support)
const ProtectedRoute = ({ children, requireAdmin = false, requireUser = false }) => {
  const { admin, user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check specific requirements
  if (requireAdmin && !admin) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireUser && !user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // General authentication check
  if (!admin && !user) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
