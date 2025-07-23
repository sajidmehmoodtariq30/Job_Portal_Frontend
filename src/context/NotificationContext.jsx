import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { API_URL } from '@/lib/apiConfig';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Add pause state// Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const adminToken = localStorage.getItem('admin_token');
      
      console.log('🔍 getUserInfo - userInfo:', userInfo);
      console.log('🔍 getUserInfo - userData:', userData);  
      console.log('🔍 getUserInfo - adminToken:', !!adminToken);
      
      const result = {
        ...userInfo,
        ...userData,
        isAdmin: userInfo.role === 'Administrator' || userInfo.role === 'admin' || !!adminToken,
        isClient: !!userData.uuid && !adminToken,
        clientId: userData.assignedClientUuid || userData.clientUuid || userData.uuid
      };
      
      console.log('🔍 getUserInfo - final result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return {};
    }
  };  // Show notification toast
  const showNotification = useCallback((notification) => {
    console.log('🔔 showNotification called with:', notification);
    
    try {
      const { type, title, message, data } = notification;
      console.log('🔔 Processing notification, type:', type, 'title:', title, 'message:', message);
      
      // Add to notifications list
      const newNotification = {
        id: notification.id || Date.now(),
        type,
        title: title || 'Notification',
        message: message || 'You have a new notification',
        data,
        timestamp: notification.timestamp || new Date(),
        read: false
      };

      console.log('📝 Adding notification to list:', newNotification);
      setNotifications(prev => {
        // Check if this notification already exists to prevent duplicates
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) {
          console.log('� Notification already exists, skipping:', newNotification.id);
          return prev;
        }
        
        const updated = [newNotification, ...prev.slice(0, 49)];
        console.log('📝 Updated notifications list length:', updated.length);
        console.log('📝 Updated notifications list:', updated);
        console.log('🔔 Bell icon should now show:', updated.length, 'notifications');
        return updated;
      });
    } catch (error) {
      console.error('🚨 Error in showNotification:', error);
    }
  }, []);  // Listen for real-time notifications via WebSocket or EventSource
  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo.clientId && !userInfo.uuid && !userInfo.id && !userInfo.isAdmin) return;

    // For now, we'll use polling. In production, you'd use WebSocket or Server-Sent Events
    const pollNotifications = async () => {
      try {
        const userId = userInfo.isAdmin ? 'admin' : (userInfo.clientId || userInfo.uuid || 'default');
        const userType = userInfo.isAdmin ? 'admin' : 'client';
        
        console.log('🔄 Polling notifications:', { userId, userType, isAdmin: userInfo.isAdmin });
        const url = `${API_URL}/api/notifications/poll?userId=${userId}&userType=${userType}`;
        console.log('📡 Polling URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Poll response status:', response.status);
        console.log('📡 Poll response headers:', response.headers);
        
        if (response.ok) {
          const responseText = await response.text();
          console.log('📬 Raw response text:', responseText);
          
          let newNotifications;
          try {
            newNotifications = JSON.parse(responseText);
          } catch (parseError) {
            console.error('📬 Error parsing response:', parseError);
            return;
          }
          
          console.log('📬 Parsed notifications:', newNotifications);
          if (Array.isArray(newNotifications)) {
            console.log(`📬 Processing ${newNotifications.length} notifications`);
            
            // Show all notifications from backend - they should persist until manually cleared
            // Only filter out notifications that are already in our local state
            setNotifications(prevNotifications => {
              const unseenNotifications = newNotifications.filter(newNotif => {
                const notifId = newNotif.id || `${newNotif.type}_${newNotif.timestamp}`;
                return !prevNotifications.some(existingNotif => existingNotif.id === notifId);
              });
              
              console.log(`📬 Found ${unseenNotifications.length} new unseen notifications`);
              
              if (unseenNotifications.length > 0) {
                const notificationsToAdd = unseenNotifications.map(notification => ({
                  id: notification.id || `${notification.type}_${notification.timestamp}`,
                  type: notification.type,
                  title: notification.title || 'Notification',
                  message: notification.message || 'You have a new notification',
                  data: notification.data,
                  timestamp: notification.timestamp || new Date(),
                  read: false
                }));
                
                console.log('📬 Adding notifications to state:', notificationsToAdd);
                return [...notificationsToAdd, ...prevNotifications.slice(0, 50 - notificationsToAdd.length)];
              }
              
              return prevNotifications;
            });
          } else {
            console.warn('📬 Received non-array response:', newNotifications);
          }
        } else {
          const errorText = await response.text();
          console.warn('Notification polling failed:', response.status, response.statusText, errorText);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Poll every 5 minutes for notifications
    const interval = setInterval(() => {
      if (!isPaused) {
        pollNotifications();
      }
    }, 300000);
    setIsConnected(true);

    // Poll immediately on mount
    pollNotifications();

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  // Manual notification trigger (for testing or manual events)
  const triggerNotification = useCallback((type, message, data = {}) => {
    showNotification({ type, message, data });
  }, [showNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const userInfo = getUserInfo();
      const userId = userInfo.isAdmin ? 'admin' : (userInfo.clientId || userInfo.uuid || 'default');
      const userType = userInfo.isAdmin ? 'admin' : 'client';
      
      // Clear backend notifications
      const response = await fetch(`${API_URL}/api/notifications/clear?userId=${userId}&userType=${userType}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('✅ Backend notifications cleared');
      } else {
        console.warn('⚠️ Failed to clear backend notifications');
      }
    } catch (error) {
      console.error('Error clearing backend notifications:', error);
    }    // Clear frontend notifications
    setNotifications([]);
  }, []);

  // Pause/resume notification polling
  const pausePolling = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumePolling = useCallback(() => {
    setIsPaused(false);
  }, []);  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    isConnected,
    isPaused,
    showNotification,
    triggerNotification,
    markAsRead,
    clearAll,
    pausePolling,
    resumePolling
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
