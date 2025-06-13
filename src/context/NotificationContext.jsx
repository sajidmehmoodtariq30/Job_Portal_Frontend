import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/apiConfig';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const adminToken = localStorage.getItem('admin_token');
      
      return {
        ...userInfo,
        ...userData,
        isAdmin: userInfo.role === 'Administrator' || userInfo.role === 'admin' || !!adminToken,
        isClient: !!userData.uuid && !adminToken,
        clientId: userData.assignedClientUuid || userData.clientUuid || userData.uuid
      };
    } catch (error) {
      console.error('Error parsing user info:', error);
      return {};
    }
  };

  // Show notification toast
  const showNotification = useCallback((notification) => {
    const { type, title, message, data } = notification;
    
    // Map business workflow types to toast variants
    const getToastVariant = (type) => {
      switch (type) {
        case 'job_created':
        case 'quote_accepted':
          return 'success';
        case 'job_status_update':
          return 'default';
        case 'quote_declined':
          return 'destructive';
        case 'note_added':
        case 'attachment_added':
          return 'default';
        default:
          return 'default';
      }
    };

    // Format title based on type
    const getTitle = (type, data) => {
      switch (type) {
        case 'job_created':
          return '🔧 New Job Created';
        case 'job_status_update':
          return '📋 Job Status Updated';
        case 'quote_accepted':
          return '✅ Quote Accepted';
        case 'quote_declined':
          return '❌ Quote Declined';
        case 'note_added':
          return '📝 Note Added';
        case 'attachment_added':
          return '📎 Attachment Added';
        default:
          return title || 'Notification';
      }
    };

    // Format description based on type
    const getDescription = (type, message, data) => {
      switch (type) {
        case 'job_created':
          return `Job "${data?.jobDescription || 'New Job'}" has been created${data?.client ? ` for ${data.client}` : ''}`;
        case 'job_status_update':
          return `Job status changed from "${data?.oldStatus || 'Unknown'}" to "${data?.newStatus || 'Unknown'}"`;
        case 'quote_accepted':
          return `Quote for "${data?.jobDescription || 'job'}" has been accepted${data?.amount ? ` ($${data.amount})` : ''}`;
        case 'quote_declined':
          return `Quote for "${data?.jobDescription || 'job'}" has been declined`;
        case 'note_added':
          return `New note added to job "${data?.jobDescription || 'job'}"`;
        case 'attachment_added':
          return `New attachment added to job "${data?.jobDescription || 'job'}"`;
        default:
          return message || 'You have a new notification';
      }
    };

    toast({
      title: getTitle(type, data),
      description: getDescription(type, message, data),
      variant: getToastVariant(type),
      duration: 5000
    });

    // Add to notifications list
    const newNotification = {
      id: Date.now(),
      type,
      title: getTitle(type, data),
      message: getDescription(type, message, data),
      data,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  }, [toast]);  // Listen for real-time notifications via WebSocket or EventSource  useEffect(() => {  // Listen for real-time notifications via WebSocket or EventSource
  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo.clientId && !userInfo.uuid && !userInfo.id && !userInfo.isAdmin) return;    // For now, we'll use polling. In production, you'd use WebSocket or Server-Sent Events
    const pollNotifications = async () => {
      try {
        const userId = userInfo.isAdmin ? 'admin' : (userInfo.clientId || userInfo.uuid || 'default');
        const userType = userInfo.isAdmin ? 'admin' : 'client';
        const response = await fetch(`${API_URL}/api/notifications/poll?userId=${userId}&userType=${userType}`);
        if (response.ok) {
          const newNotifications = await response.json();
          if (Array.isArray(newNotifications)) {
            newNotifications.forEach(notification => {
              showNotification(notification);
            });
          }
        } else {
          console.warn('Notification polling failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    // Poll every 5 seconds for better real-time experience
    const interval = setInterval(pollNotifications, 5000);
    setIsConnected(true);

    // Poll immediately on mount
    pollNotifications();

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [showNotification]);

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
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    isConnected,
    showNotification,
    triggerNotification,
    markAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
