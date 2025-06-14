import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const SessionContext = createContext({});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const navigate = useNavigate();

  // Session duration constants (in milliseconds)
  const ADMIN_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  const USER_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

  // Initialize session from localStorage
  useEffect(() => {
    initializeSession();
  }, []);

  // Session expiry checker
  useEffect(() => {
    if (sessionExpiry) {
      const interval = setInterval(() => {
        checkSessionExpiry();
      }, SESSION_CHECK_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [sessionExpiry]);
  const initializeSession = useCallback(() => {
    console.log('Initializing session...');
    setIsLoading(true);
    
    try {
      // Check for admin session
      const adminToken = localStorage.getItem('admin_token');
      const adminSessionData = localStorage.getItem('admin_session');
      
      console.log('Admin token exists:', !!adminToken);
      console.log('Admin session data exists:', !!adminSessionData);
      
      if (adminToken && adminSessionData) {
        const sessionData = JSON.parse(adminSessionData);
        const now = Date.now();
        
        console.log('Admin session data:', sessionData);
        console.log('Session expires at:', new Date(sessionData.expiresAt));
        console.log('Current time:', new Date(now));
        
        if (now < sessionData.expiresAt) {
          // Valid admin session
          console.log('Valid admin session found, setting admin state');
          setAdmin({
            token: JSON.parse(adminToken),
            sessionId: sessionData.sessionId,
            loginTime: sessionData.loginTime
          });
          setSessionExpiry(sessionData.expiresAt);
          setupAxiosInterceptors(true);
          console.log('Admin session initialized successfully');
        } else {
          // Expired admin session
          console.log('Admin session expired, clearing...');
          clearAdminSession();
        }
      }

      // Check for user session
      const userData = localStorage.getItem('user_data');
      const userSessionData = localStorage.getItem('user_session');
      
      console.log('User data exists:', !!userData);
      console.log('User session data exists:', !!userSessionData);
      
      if (userData && userSessionData) {
        const sessionData = JSON.parse(userSessionData);
        const now = Date.now();
        
        console.log('User session data:', sessionData);
        console.log('Session expires at:', new Date(sessionData.expiresAt));
        
        if (now < sessionData.expiresAt) {
          // Valid user session
          console.log('Valid user session found, setting user state');
          setUser({
            ...JSON.parse(userData),
            sessionId: sessionData.sessionId,
            loginTime: sessionData.loginTime
          });
          setSessionExpiry(sessionData.expiresAt);
          setupAxiosInterceptors(false);
          console.log('User session initialized successfully');
        } else {
          // Expired user session
          console.log('User session expired, clearing...');
          clearUserSession();
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      clearAllSessions();
    }
    
    setIsLoading(false);
    console.log('Session initialization complete');
  }, []);

  const setupAxiosInterceptors = (isAdmin) => {
    // Request interceptor to add auth headers
    axios.interceptors.request.use(
      (config) => {
        if (isAdmin && admin) {
          config.headers['Authorization'] = `Bearer ${admin.token.access_token}`;
        } else if (!isAdmin && user) {
          config.headers['x-client-uuid'] = user.uuid;
          config.headers['x-user-email'] = localStorage.getItem('user_email');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear session and redirect
          if (isAdmin) {
            handleAdminLogout();
          } else {
            handleUserLogout();
          }
        }
        return Promise.reject(error);
      }
    );
  };

  const checkSessionExpiry = () => {
    const now = Date.now();
    const timeUntilExpiry = sessionExpiry - now;

    if (timeUntilExpiry <= 0) {
      // Session expired
      if (admin) {
        handleAdminLogout('Session expired');
      } else if (user) {
        handleUserLogout('Session expired');
      }
    } else if (timeUntilExpiry <= SESSION_WARNING_TIME) {
      // Show warning
      showSessionWarning(Math.ceil(timeUntilExpiry / 60000)); // minutes remaining
    }
  };

  const showSessionWarning = (minutesRemaining) => {
    const userType = admin ? 'admin' : 'user';
    const message = `Your session will expire in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}. Please save your work.`;
    
    // You can replace this with a toast notification or modal
    console.warn(`[${userType.toUpperCase()}] ${message}`);
    
    // Optional: Show a toast notification if you have one
    // toast({ title: "Session Warning", description: message, variant: "warning" });
  };  const createAdminSession = (tokenData) => {
    console.log('Creating admin session with token data:', tokenData);
    const now = Date.now();
    const expiresAt = now + ADMIN_SESSION_DURATION;
    const sessionId = generateSessionId();

    const sessionData = {
      sessionId,
      loginTime: now,
      expiresAt,
      userType: 'admin'
    };

    console.log('Admin session data to store:', sessionData);

    // Store in localStorage
    localStorage.setItem('admin_token', JSON.stringify(tokenData));
    localStorage.setItem('admin_session', JSON.stringify(sessionData));
    localStorage.setItem('admin_login_time', now.toString());

    console.log('Data stored in localStorage');

    // Update state immediately and synchronously
    const adminData = {
      token: tokenData,
      sessionId,
      loginTime: now
    };
    
    console.log('Setting admin state:', adminData);
    setAdmin(adminData);
    setSessionExpiry(expiresAt);
    setupAxiosInterceptors(true);

    console.log('Admin session created successfully');
    return sessionData;
  };

  const createUserSession = (userData) => {
    const now = Date.now();
    const expiresAt = now + USER_SESSION_DURATION;
    const sessionId = generateSessionId();

    const sessionData = {
      sessionId,
      loginTime: now,
      expiresAt,
      userType: 'user'
    };

    // Store in localStorage
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_session', JSON.stringify(sessionData));
    localStorage.setItem('user_login_time', now.toString());

    // Update state
    setUser({
      ...userData,
      sessionId,
      loginTime: now
    });
    setSessionExpiry(expiresAt);
    setupAxiosInterceptors(false);

    return sessionData;
  };

  const extendSession = () => {
    const now = Date.now();
    
    if (admin) {
      const newExpiresAt = now + ADMIN_SESSION_DURATION;
      const sessionData = JSON.parse(localStorage.getItem('admin_session'));
      sessionData.expiresAt = newExpiresAt;
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      setSessionExpiry(newExpiresAt);
    } else if (user) {
      const newExpiresAt = now + USER_SESSION_DURATION;
      const sessionData = JSON.parse(localStorage.getItem('user_session'));
      sessionData.expiresAt = newExpiresAt;
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      setSessionExpiry(newExpiresAt);
    }
  };

  const clearAdminSession = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_login_time');
    setAdmin(null);
    setSessionExpiry(null);
  };

  const clearUserSession = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_session');
    localStorage.removeItem('user_login_time');
    localStorage.removeItem('user_email');
    localStorage.removeItem('client_data');
    localStorage.removeItem('client_email');
    setUser(null);
    setSessionExpiry(null);
  };

  const clearAllSessions = () => {
    clearAdminSession();
    clearUserSession();
  };  const handleAdminLogin = (tokenData, onSuccess) => {
    console.log('🔐 Admin login initiated');
    clearUserSession(); // Clear any existing user session
    
    // Create session and update state
    const sessionData = createAdminSession(tokenData);
    console.log('✅ Admin session created successfully');
    
    // Simple timeout to ensure state is updated, then call success callback
    setTimeout(() => {
      console.log('🚀 Calling success callback');
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      } else {
        console.log('🏠 Navigating to admin dashboard');
        navigate('/admin');
      }
    }, 100); // Reduced timeout
  };

  const handleUserLogin = (userData, email) => {
    clearAdminSession(); // Clear any existing admin session
    localStorage.setItem('user_email', email);
    localStorage.setItem('client_data', JSON.stringify(userData)); // For backward compatibility
    localStorage.setItem('client_email', email); // For backward compatibility
    createUserSession(userData);
    navigate('/client');
  };

  const handleAdminLogout = (reason = '') => {
    clearAdminSession();
    if (reason) {
      console.log(`Admin logout: ${reason}`);
    }
    navigate('/login');
  };

  const handleUserLogout = (reason = '') => {
    clearUserSession();
    if (reason) {
      console.log(`User logout: ${reason}`);
    }
    navigate('/login');
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const isAuthenticated = () => {
    return !!(admin || user);
  };

  const isAdmin = () => {
    return !!admin;
  };

  const isUser = () => {
    return !!user;
  };

  const getSessionTimeRemaining = () => {
    if (!sessionExpiry) return 0;
    const remaining = sessionExpiry - Date.now();
    return Math.max(0, remaining);
  };

  const value = {
    // State
    user,
    admin,
    isLoading,
    sessionExpiry,
    
    // Methods
    handleAdminLogin,
    handleUserLogin,
    handleAdminLogout,
    handleUserLogout,
    extendSession,
    isAuthenticated,
    isAdmin,
    isUser,
    getSessionTimeRemaining,
    clearAllSessions
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};