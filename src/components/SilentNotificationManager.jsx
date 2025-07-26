import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useSession } from '@/context/SessionContext';
import { useClientAssignment } from '@/context/ClientAssignmentContext';

/**
 * Silent Notification Manager
 * Handles all background notifications and validations without interrupting user workflow
 */
const SilentNotificationManager = () => {
  const { notifications, pausePolling, resumePolling } = useNotifications();
  const { user } = useSession();
  const { hasValidAssignment, isValidating } = useClientAssignment();
  const [userActivity, setUserActivity] = useState(Date.now());
  const [showValidationStatus, setShowValidationStatus] = useState(false);

  // Track user activity to pause notifications during active use
  useEffect(() => {
    const updateActivity = () => setUserActivity(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Pause notifications during active user interaction
  useEffect(() => {
    const checkActivity = () => {
      const now = Date.now();
      const timeSinceActivity = now - userActivity;
      
      // If user has been active in the last 30 seconds, pause notifications
      if (timeSinceActivity < 30000) {
        pausePolling();
      } else {
        resumePolling();
      }
    };

    const interval = setInterval(checkActivity, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [userActivity, pausePolling, resumePolling]);

  // Handle validation states silently with minimal UI feedback
  useEffect(() => {
    if (isValidating) {
      console.log('🔍 Background validation in progress...');
      setShowValidationStatus(true);
      
      // Hide validation status after 3 seconds even if still validating
      const timer = setTimeout(() => {
        setShowValidationStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowValidationStatus(false);
    }
  }, [isValidating]);

  // Handle client assignment changes silently
  useEffect(() => {
    if (user && !hasValidAssignment) {
      console.log('⚠️ User client assignment needs attention (handled silently)');
    }
  }, [user, hasValidAssignment]);

  // Process notifications silently (no UI blocking)
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadCount = notifications.filter(n => !n.read).length;
      if (unreadCount > 0) {
        console.log(`📬 ${unreadCount} unread notifications (processed silently)`);
        
        // Update document title to show notification count
        const originalTitle = document.title.replace(/ \(\d+\)$/, '');
        document.title = unreadCount > 0 ? `${originalTitle} (${unreadCount})` : originalTitle;
      }
    }
  }, [notifications]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = document.title.replace(/ \(\d+\)$/, '');
    };
  }, []);

  // Render minimal validation status indicator when needed
  return (
    <>
      {showValidationStatus && isValidating && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-700">Validating access...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SilentNotificationManager;